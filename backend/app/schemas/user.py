from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: Optional[str] = "customer"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserOut(UserBase):
    id: int

    class Config:
        from_attributes = True

class LoginIn(BaseModel):
    email: EmailStr
    password: str
