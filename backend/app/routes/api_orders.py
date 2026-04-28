from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import httpx
from datetime import datetime

from .. import schemas, models
from ..core.config import settings
from ..core.ratelimit import limiter
from ..db.database import get_db
from ..constants import STATUS_PLACED, STATUS_ACCEPTED, STATUS_REJECTED, STATUS_ASSIGNED, STATUS_DELIVERED
from ..auth_v2.deps import get_current_user, require_vendor
from ..services import order_service, dish_service, driver_service
from ..email_service import (
    send_order_bill_email,
    send_order_accepted_email,
    send_order_on_the_way_email,
    send_order_rejected_email,
    send_order_delivered_email,
)

router = APIRouter(prefix='/api/orders', tags=['orders'])

@router.post('/', response_model=schemas.OrderOut)
@limiter.limit("5/minute")
def create_order(
    request: Request,
    payload: schemas.OrderCreate, 
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    # Validate dishes
    items = []
    for it in payload.items:
        dish = dish_service.get_dish(db, it.dish_id)
        if dish:
            items.append({
                'dish_id': dish.id,
                'quantity': it.quantity,
                'price': float(dish.price),
                'name': it.name or dish.name,
            })
        elif it.name and it.price is not None:
            # Allow virtual/addon items not in DB if name and price are provided
            items.append({
                'dish_id': it.dish_id,
                'quantity': it.quantity,
                'price': float(it.price),
                'name': it.name,
            })
        else:
            raise HTTPException(status_code=404, detail=f'Dish {it.dish_id} not found and no info provided')

    # Compute totals
    total = sum([it['price'] * int(it['quantity']) for it in items])
    final = total
    
    # Apply coupon
    if payload.coupon_code:
        coupon = dish_service.get_coupon_by_code(db, payload.coupon_code)
        if not coupon:
            raise HTTPException(status_code=400, detail='Invalid coupon')
        
        if coupon.code == 'PAID' and coupon.discount_type == 'full':
            pass
        elif coupon.discount_type == 'flat':
            final = max(0.0, total - coupon.value)
        elif coupon.discount_type == 'percentage':
            final = total * (1 - coupon.value / 100.0)

    # Bypass payment check for 'PAID' coupon
    is_prepaid = payload.coupon_code and payload.coupon_code.upper() == 'PAID'
    if final > 0 and not is_prepaid:
        raise HTTPException(status_code=400, detail='Payment required')

    # Create address string for DB
    address_str = json.dumps(payload.address.model_dump())

    try:
        order = order_service.create_order(
            db=db,
            user_id=user.id,
            items=items,
            address=address_str,
            email=payload.email,
            total_amount=total,
            final_amount=final
        )
        
        # Send bill email
        try:
            send_order_bill_email(payload.email, order.id, items, final)
        except Exception as e:
            print(f'[EMAIL] ❌ Error sending bill: {e}')
        
        return order
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/vendor', response_model=schemas.OrdersListOut)
def vendor_orders(db: Session = Depends(get_db), user: models.User = Depends(require_vendor)):
    orders = order_service.get_orders_for_vendor(db)
    return {'orders': orders}

@router.get('/my', response_model=schemas.OrdersListOut)
def my_orders(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    orders = order_service.get_orders_by_user(db, user.id)
    return {'orders': orders}

@router.post('/{id}/approve', response_model=schemas.OrderSingleOut)
def approve_order(id: int, db: Session = Depends(get_db), user: models.User = Depends(require_vendor)):
    order = order_service.get_order_by_id(db, id)
    if not order:
        raise HTTPException(status_code=404, detail='Order not found')
    
    if order.status != STATUS_PLACED:
        raise HTTPException(status_code=400, detail='Can only approve PLACED orders')
        
    updated = order_service.set_order_status(db, id, STATUS_ACCEPTED)
    
    if order.email:
        try:
            send_order_accepted_email(order.email, id)
        except Exception as e:
            print(f'[EMAIL] ❌ Error: {e}')
            
    return {'order': updated}

@router.post('/{id}/assign', response_model=schemas.OrderSingleOut)
def assign_delivery(id: int, db: Session = Depends(get_db), user: models.User = Depends(require_vendor)):
    order = order_service.get_order_by_id(db, id)
    if not order:
        raise HTTPException(status_code=404, detail='Order not found')
    
    # Allow assigning if it's ACCEPTED or already ASSIGNED (idempotent)
    if order.status not in [STATUS_ACCEPTED, STATUS_ASSIGNED]:
        raise HTTPException(status_code=400, detail=f'Cannot assign order in {order.status} status')
    
    # Initialize tracking data immediately when assigned
    tracking_data = {
        "status": STATUS_ASSIGNED,
        "delivery_start_time": datetime.utcnow(),
        "delivery_duration_seconds": 60, # 2 minutes as requested
        "start_lat": 12.9716,
        "start_lng": 77.5946,
        "end_lat": 12.9716 + 0.05,
        "end_lng": 77.5946 + 0.05
    }
    
    updated = order_service.set_order_tracking(db, id, tracking_data)
    
    # Generate OTP
    otp = None
    try:
        address_data = json.loads(order.address) if isinstance(order.address, str) else order.address
        customer_name = address_data.get('full_name', 'Customer')
        otp = order_service.create_order_otp(db, id, customer_name)
    except Exception as e:
        db.rollback()
        print(f'[OTP] ❌ Error creating OTP: {e}')

    if order.email:
        try:
            send_order_on_the_way_email(order.email, id, otp=otp)
        except Exception as e:
            print(f'[EMAIL] ❌ Error: {e}')
            
    # Notify Driver
    try:
        driver_payload = {
            "order_id": order.id,
            "customer_name": customer_name,
            "customer_email": order.email,
            "delivery_address": address_data if isinstance(address_data, dict) else order.address,
            "total_amount": order.final_amount,
            "otp": otp,
            "tracking": {
                "start_lat": tracking_data.get("start_lat"),
                "start_lng": tracking_data.get("start_lng"),
                "end_lat": tracking_data.get("end_lat"),
                "end_lng": tracking_data.get("end_lng"),
                "duration": tracking_data.get("delivery_duration_seconds")
            },
            "items": [{"name": item.name, "quantity": item.quantity} for item in order.items]
        }
        driver_service.notify_driver(driver_payload)
        print(f"[Driver] 🚚 Information sent to driver for order #{order.id}")
    except Exception as e:
        print(f"[Driver] ❌ Failed to notify driver: {e}")

    return {'order': updated}

@router.post('/assign-external', response_model=dict)
def assign_external(payload: schemas.ExternalAssignIn, db: Session = Depends(get_db), user: models.User = Depends(require_vendor)):
    # External integration logic matching internal assignment
    order_id = payload.order.get('id')
    print(f"=== EXTERNAL ASSIGNMENT TRIGGERED FOR ORDER #{order_id} ===")
    
    order = order_service.get_order_by_id(db, order_id)
    if not order:
        return {"status": "error", "message": "Order not found"}

    # Initialize tracking data for external assignments too
    tracking_data = {
        "status": STATUS_ASSIGNED,
        "delivery_start_time": order.delivery_start_time or datetime.utcnow(),
        "delivery_duration_seconds": order.delivery_duration_seconds or 120,
        "start_lat": order.start_lat or 12.9716,
        "start_lng": order.start_lng or 77.5946,
        "end_lat": order.end_lat or (12.9716 + 0.05),
        "end_lng": order.end_lng or (77.5946 + 0.05)
    }
    
    order_service.set_order_tracking(db, order_id, tracking_data)
    
    # Generate OTP for external assignment
    otp = None
    try:
        address_data = json.loads(order.address) if isinstance(order.address, str) else order.address
        customer_name = address_data.get('full_name', 'Customer')
        otp = order_service.create_order_otp(db, order_id, customer_name)
    except Exception as e:
        db.rollback()
        print(f'[OTP] ❌ Error creating OTP: {e}')

    if order.email:
        try:
            send_order_on_the_way_email(order.email, order_id, otp=otp)
        except Exception as e:
            print(f'[EMAIL] ❌ Error: {e}')

    # Notify Driver
    try:
        driver_payload = {
            "order_id": order.id,
            "customer_name": customer_name,
            "customer_email": order.email,
            "delivery_address": address_data if isinstance(address_data, dict) else order.address,
            "total_amount": order.final_amount,
            "otp": otp,
            "tracking": {
                "start_lat": tracking_data.get("start_lat"),
                "start_lng": tracking_data.get("start_lng"),
                "end_lat": tracking_data.get("end_lat"),
                "end_lng": tracking_data.get("end_lng"),
                "duration": tracking_data.get("delivery_duration_seconds")
            },
            "items": [{"name": item.name, "quantity": item.quantity} for item in order.items]
        }
        driver_service.notify_driver(driver_payload)
        print(f"[Driver] 🚚 Information sent to driver for order #{order.id} (External)")
    except Exception as e:
        print(f"[Driver] ❌ Failed to notify driver (External): {e}")

    return {"status": "success", "message": "External assignment successful"}

@router.post('/{id}/out-of-stock', response_model=schemas.OrderSingleOut)
def out_of_stock(id: int, db: Session = Depends(get_db), user: models.User = Depends(require_vendor)):
    order = order_service.get_order_by_id(db, id)
    if not order:
        raise HTTPException(status_code=404, detail='Order not found')
        
    reason = 'Out of stock'
    updated = order_service.set_order_status(db, id, STATUS_REJECTED, reason)
    
    if order.email:
        try:
            send_order_rejected_email(order.email, id, reason)
        except Exception as e:
            print(f'[EMAIL] ❌ Error: {e}')
            
    return {'order': updated}

@router.get('/{id}/tracking', response_model=dict)
def get_tracking(id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    order = order_service.get_order_by_id(db, id)
    if not order:
        raise HTTPException(status_code=404, detail='Order not found')
    
    # Calculate progress based on status and time
    progress = 0.0
    if order.status == STATUS_DELIVERED:
        progress = 1.0
    elif order.status == STATUS_ASSIGNED and order.delivery_start_time:
        elapsed = (datetime.utcnow() - order.delivery_start_time).total_seconds()
        duration = order.delivery_duration_seconds or 120
        progress = min(0.99, elapsed / duration)
        
        # Auto-complete if progress reached 100%
        if progress >= 0.99:
            order_service.set_order_status(db, id, STATUS_DELIVERED)
            progress = 1.0
            # Send delivered email
            if order.email:
                try:
                    send_order_delivered_email(order.email, id)
                except Exception as e:
                    print(f'[EMAIL] ❌ Error sending delivered email: {e}')
            
    # Get OTP if exists
    otp_record = order_service.get_order_otp(db, id)
    otp = otp_record.otp if otp_record else None

    return {
        'order_id': order.id,
        'status': order.status,
        'progress': progress,
        'lat': order.start_lat,
        'lng': order.start_lng,
        'otp': otp,
        'rejection_reason': getattr(order, 'rejection_reason', None)
    }

@router.post('/{id}/reject', response_model=schemas.OrderSingleOut)
def reject_order(id: int, payload: schemas.RejectIn, db: Session = Depends(get_db), user: models.User = Depends(require_vendor)):
    order = order_service.get_order_by_id(db, id)
    if not order:
        raise HTTPException(status_code=404, detail='Order not found')
        
    reason = payload.reason or 'Rejected by vendor'
    updated = order_service.set_order_status(db, id, STATUS_REJECTED, reason)
    
    if order.email:
        try:
            send_order_rejected_email(order.email, id, reason)
        except Exception as e:
            print(f'[EMAIL] ❌ Error: {e}')
            
    return {'order': updated}
