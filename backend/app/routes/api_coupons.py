from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import schemas
from ..db.database import get_db
from ..services import dish_service

router = APIRouter(prefix='/api/coupons', tags=['coupons'])

@router.post('/apply', response_model=dict)
def apply_coupon(payload: schemas.CouponApplyIn, db: Session = Depends(get_db)):
    coupon = dish_service.get_coupon_by_code(db, payload.code)
    if not coupon:
        raise HTTPException(status_code=400, detail='Invalid coupon')
    
    # 'PAID' coupon no longer sets final_amount to 0, but still returns original total
    if coupon.code == 'PAID' and coupon.discount_type == 'full':
        return {'final_amount': payload.total_amount}
        
    if coupon.discount_type == 'flat':
        final = max(0.0, payload.total_amount - coupon.value)
        return {'final_amount': final}
        
    if coupon.discount_type == 'percentage':
        final = payload.total_amount * (1 - coupon.value / 100.0)
        return {'final_amount': final}
        
    raise HTTPException(status_code=400, detail='Unsupported coupon')
