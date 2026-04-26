from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from ..core.config import settings
from fastapi import HTTPException, status
import logging

# Suppress the annoying passlib bcrypt version warning
logging.getLogger('passlib').setLevel(logging.ERROR)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_safe_password(password: str) -> str:
    # Ensure the password doesn't exceed 72 bytes (not just characters)
    pwd_bytes = password.encode('utf-8')
    if len(pwd_bytes) > 72:
        # Safely truncate bytes and ignore broken multibyte characters at the end
        return pwd_bytes[:72].decode('utf-8', 'ignore')
    return password

def hash_password(password: str) -> str:
    safe_password = get_safe_password(password)
    return pwd_context.hash(safe_password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    safe_password = get_safe_password(plain_password)
    try:
        return pwd_context.verify(safe_password, hashed_password)
    except ValueError:
        # Fallback if bcrypt still complains
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
