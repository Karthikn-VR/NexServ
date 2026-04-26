from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from ..core.config import settings
from fastapi import HTTPException, status
import logging

# Suppress the annoying passlib bcrypt version warning
logging.getLogger('passlib').setLevel(logging.ERROR)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password[:72])

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password[:72], hashed_password)
    except Exception:
        return False

def create_jwt_token(user_id: int, role: str, email: str) -> str:
    now = datetime.utcnow()
    payload = {
        'sub': str(user_id),
        'role': role,
        'email': email,
        'iat': now,
        'exp': now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.ALGORITHM)

def verify_jwt_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
    except JWTError:
        raise
