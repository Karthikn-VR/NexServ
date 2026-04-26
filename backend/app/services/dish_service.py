from sqlalchemy.orm import Session
from .. import models

def create_dish(db: Session, name: str, price: float, available_today: bool = True, description: str = None, category: str = None, image_url: str = None):
    dish = models.Dish(name=name, price=price, available_today=available_today, description=description, category=category, image_url=image_url)
    db.add(dish)
    db.commit()
    db.refresh(dish)
    return dish

def get_available_dishes(db: Session):
    return db.query(models.Dish).filter(models.Dish.available_today == True).all()

def get_dish(db: Session, dish_id: int):
    return db.query(models.Dish).filter(models.Dish.id == dish_id).first()

def create_coupon(db: Session, code: str, discount_type: str, value: float):
    coupon = models.Coupon(code=code, discount_type=discount_type, value=value)
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon

def get_coupon_by_code(db: Session, code: str):
    return db.query(models.Coupon).filter(models.Coupon.code == code).first()
