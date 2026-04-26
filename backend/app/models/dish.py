from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from .base import Base

class Dish(Base):
    __tablename__ = 'dishes'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    available_today = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow)

class Coupon(Base):
    __tablename__ = 'coupons'
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False, index=True)
    discount_type = Column(String, nullable=False)
    value = Column(Float, nullable=False)
