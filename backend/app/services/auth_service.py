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
    # Truncate the string itself (not bytes) to max 72 UTF-8 characters
    if len(password.encode('utf-8')) > 72:
        # Convert to bytes, truncate, then safely decode
        pwd_bytes = password.encode('utf-8')[:72]
        # Find the last valid UTF-8 sequence boundary
        try:
            return pwd_bytes.decode('utf-8')
        except UnicodeDecodeError:
            # If truncation broke a multi-byte character, remove the last byte
            return pwd_bytes[:-1].decode('utf-8', 'ignore')
    return password

def hash_password(password: str) -> str:
    return pwd_context.hash(get_safe_password(password))

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(get_safe_password(plain_password), hashed_password)
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
