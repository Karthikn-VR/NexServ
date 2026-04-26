from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from .. import schemas, models
from ..db.database import get_db
from ..services import auth_service, user_service
from ..auth_v2.deps import get_current_user
from ..core.ratelimit import limiter

router = APIRouter(prefix='/api/auth', tags=['auth'])

@router.post('/register', response_model=schemas.UserOut)
@limiter.limit("5/minute")
def register(request: Request, payload: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = user_service.get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail='Email already registered'
        )
    
    hashed_password = auth_service.hash_password(payload.password)
    user = user_service.create_user(
        db, 
        name=payload.name, 
        email=payload.email, 
        password_hash=hashed_password, 
        role=payload.role or 'customer'
    )
    return user

@router.post('/login', response_model=schemas.Token)
@limiter.limit("10/minute")
def login(request: Request, payload: schemas.LoginIn, db: Session = Depends(get_db)):
    user = user_service.get_user_by_email(db, payload.email)
    if not user or not auth_service.verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail='Invalid credentials'
        )
    
    access_token = auth_service.create_jwt_token(
        user_id=user.id, 
        role=user.role, 
        email=user.email
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get('/me', response_model=schemas.UserOut)
def get_me(user: models.User = Depends(get_current_user)):
    return user
