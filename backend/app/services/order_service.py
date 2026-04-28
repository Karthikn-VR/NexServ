import random
import string
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Dict, Any
from .. import models
from ..constants import STATUS_PLACED

def generate_otp(length: int = 5) -> str:
    return ''.join(random.choices(string.digits, k=length))

def create_order_otp(db: Session, order_id: int, customer_name: str) -> str:
    # Check if OTP already exists
    existing = get_order_otp(db, order_id)
    if existing:
        return existing.otp
        
    otp = generate_otp()
    order_otp = models.OrderOTP(
        order_id=order_id,
        customer_name=customer_name,
        otp=otp
    )
    db.add(order_otp)
    db.commit()
    db.refresh(order_otp)
    return otp

def get_order_otp(db: Session, order_id: int) -> models.OrderOTP | None:
    return db.query(models.OrderOTP).filter(models.OrderOTP.order_id == order_id).first()

def create_order(
    db: Session,
    user_id: int,
    items: List[Dict[str, Any]],
    address: str,
    email: str,
    total_amount: float,
    final_amount: float,
) -> models.Order:
    order = models.Order(
        user_id=user_id,
        status=STATUS_PLACED,
        total_amount=total_amount,
        final_amount=final_amount,
        address=address,
        email=email
    )
    db.add(order)
    db.flush()  # Get order ID

    for it in items:
        order_item = models.OrderItem(
            order_id=order.id,
            dish_id=it['dish_id'],
            name=it['name'],
            quantity=it['quantity'],
            price=it['price']
        )
        db.add(order_item)
    
    db.commit()
    db.refresh(order)
    return order

def get_orders_by_user(db: Session, user_id: int) -> List[models.Order]:
    return db.query(models.Order).filter(models.Order.user_id == user_id).order_by(models.Order.created_at.desc()).all()

def get_orders_for_vendor(db: Session) -> List[models.Order]:
    return db.query(models.Order).order_by(models.Order.created_at.desc()).all()

def get_order_by_id(db: Session, order_id: int) -> models.Order:
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def set_order_status(db: Session, order_id: int, status: str, rejection_reason: str | None = None) -> models.Order:
    order = get_order_by_id(db, order_id)
    if order:
        order.status = status
        if rejection_reason:
            order.rejection_reason = rejection_reason
        db.commit()
        db.refresh(order)
    return order

def set_order_tracking(db: Session, order_id: int, tracking_data: Dict[str, Any]) -> models.Order:
    order = get_order_by_id(db, order_id)
    if order:
        for key, value in tracking_data.items():
            if hasattr(order, key):
                setattr(order, key, value)
        db.commit()
        db.refresh(order)
    return order
