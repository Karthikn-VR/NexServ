from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from .. import schemas, models
from ..db.database import get_db
from ..services import auth_service, user_service
from ..auth_v2.deps import get_current_user
from ..core.ratelimit import limiter
from ..core.logging_config import logger

router = APIRouter(prefix='/api/auth', tags=['auth'])

@router.post('/register')
@limiter.limit("5/minute")
def register(request: Request, payload: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Register password length: {len(payload.password)}")
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
        return {
            "status": "success",
            "message": "Registration successful",
            "data": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "role": user.role
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail="Registration failed")

@router.post('/login')
@limiter.limit("10/minute")
def login(request: Request, payload: schemas.LoginIn, db: Session = Depends(get_db)):
    try:
        logger.info(f"Login attempt: {payload.email}")
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
        return {
            "status": "success",
            "message": "Login successful",
            "data": {
                "access_token": access_token, 
                "token_type": "bearer",
                "role": user.role,
                "email": user.email,
                "name": user.name
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")

@router.get('/me')
def get_me(user: models.User = Depends(get_current_user)):
    return {
        "status": "success",
        "message": "User details fetched",
        "data": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role
        }
    }
