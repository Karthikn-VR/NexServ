from pydantic import BaseModel
from typing import Optional

class DishBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    price: float
    available_today: Optional[bool] = True

class DishCreate(DishBase):
    pass

class DishIn(DishCreate):
    pass

class DishOut(DishBase):
    id: int

    class Config:
        from_attributes = True

class CouponBase(BaseModel):
    code: str
    discount_type: str
    value: float

class CouponOut(CouponBase):
    id: int

    class Config:
        from_attributes = True

class CouponApplyIn(BaseModel):
    code: str
    total_amount: float
