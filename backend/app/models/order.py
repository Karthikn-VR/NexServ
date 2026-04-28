from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from .base import Base

class Order(Base):
    __tablename__ = 'orders'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    status = Column(String, nullable=False, default='PLACED')
    total_amount = Column(Float, nullable=False)
    final_amount = Column(Float, nullable=False)
    address = Column(Text, nullable=False)
    email = Column(String, nullable=False)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Tracking fields
    delivery_start_time = Column(DateTime, nullable=True)
    delivery_duration_seconds = Column(Integer, nullable=True)
    start_lat = Column(Float, nullable=True)
    start_lng = Column(Float, nullable=True)
    end_lat = Column(Float, nullable=True)
    end_lng = Column(Float, nullable=True)

    items = relationship('OrderItem', back_populates='order')

class OrderOTP(Base):
    __tablename__ = 'order_otps'
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey('orders.id'), nullable=False, unique=True)
    customer_name = Column(String, nullable=False)
    otp = Column(String(5), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class OrderItem(Base):
    __tablename__ = 'order_items'
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey('orders.id'), nullable=False)
    dish_id = Column(Integer, nullable=False) # Removed ForeignKey('dishes.id') to allow virtual addon items
    name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

    order = relationship('Order', back_populates='items')
