from .database import engine
from ..models import Base, Coupon
from sqlalchemy.orm import Session


def init_db():
    Base.metadata.create_all(bind=engine)
    # seed coupon PAID
    session = Session(bind=engine)
    try:
        existing = session.query(Coupon).filter(Coupon.code == 'PAID').first()
        if not existing:
            c = Coupon(code='PAID', discount_type='full', value=0.0)
            session.add(c)
            session.commit()
    finally:
        session.close()
