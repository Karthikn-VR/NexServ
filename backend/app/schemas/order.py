from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class OrderItemBase(BaseModel):
    dish_id: int
    quantity: int
    price: Optional[float] = None
    name: Optional[str] = None

class OrderItemOut(OrderItemBase):
    id: int
    
    class Config:
        from_attributes = True

class RejectIn(BaseModel):
    reason: Optional[str] = None

class ExternalAssignIn(BaseModel):
    order: dict

class AddressIn(BaseModel):
    full_name: str
    phone_number: str
    address_line_1: str
    address_line_2: Optional[str] = ""
    city: str
    state: Optional[str] = ""
    postal_code: str
    country: Optional[str] = ""

class OrderCreate(BaseModel):
    items: List[OrderItemBase]
    address: AddressIn
    email: EmailStr
    coupon_code: Optional[str] = None
    special_instructions: Optional[str] = None

class OrderOut(BaseModel):
    id: int
    user_id: int
    status: str
    total_amount: float
    final_amount: float
    address: str
    email: str
    created_at: datetime
    items: List[OrderItemOut]

    class Config:
        from_attributes = True

class OrdersListOut(BaseModel):
    orders: List[OrderOut]

class OrderSingleOut(BaseModel):
    order: OrderOut
