from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session
import json
from ..db.database import get_db
from .. import models
from ..services import order_service, driver_service
from ..constants import STATUS_ASSIGNED, STATUS_DELIVERED

router = APIRouter(prefix='/api/driver', tags=['driver'])

@router.post('/receive-order')
async def receive_order(request: Request):
    try:
        data = await request.json()
        return driver_service.notify_driver(data)
    except Exception as e:
        print(f"Error receiving order in driver endpoint: {e}")
        return {"status": "error", "message": str(e)}

@router.get('/receive-order')
async def get_all_orders(db: Session = Depends(get_db)):
    """Endpoint to view all assigned order data from the database"""
    # Fetch all orders that are either ASSIGNED or DELIVERED (to show history)
    orders = db.query(models.Order).filter(
        models.Order.status.in_([STATUS_ASSIGNED, STATUS_DELIVERED])
    ).order_by(models.Order.created_at.desc()).all()

    if not orders:
        return {"message": "No assigned orders found in the database."}

    driver_orders = []
    for order in orders:
        # Get OTP
        otp_record = order_service.get_order_otp(db, order.id)
        otp = otp_record.otp if otp_record else None
        
        # Parse address
        try:
            address_data = json.loads(order.address) if isinstance(order.address, str) else order.address
            customer_name = address_data.get('full_name', 'Customer')
        except:
            address_data = order.address
            customer_name = "Customer"

        driver_orders.append({
            "order_id": order.id,
            "status": order.status,
            "customer_name": customer_name,
            "customer_email": order.email,
            "delivery_address": address_data,
            "total_amount": order.final_amount,
            "otp": otp,
            "tracking": {
                "start_lat": order.start_lat,
                "start_lng": order.start_lng,
                "end_lat": order.end_lat,
                "end_lng": order.end_lng,
                "duration": order.delivery_duration_seconds
            },
            "items": [{"name": item.name, "quantity": item.quantity} for item in order.items]
        })

    return {
        "count": len(driver_orders),
        "orders": driver_orders
    }
