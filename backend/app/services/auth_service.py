from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from ..core.config import settings
from fastapi import HTTPException, status
import logging
from ..core.logging_config import logger

# Suppress the annoying passlib bcrypt version warning
logging.getLogger('passlib').setLevel(logging.ERROR)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_safe_password(password: str) -> str:
    logger.info(f"get_safe_password input: {password}")
    logger.info(f"get_safe_password input length: {len(password)}")
    logger.info(f"get_safe_password input type: {type(password)}")
    
    # Truncate the string itself (not bytes) to max 72 UTF-8 characters
    pwd_bytes = password.encode('utf-8')
    logger.info(f"get_safe_password bytes length: {len(pwd_bytes)}")
    
    if len(pwd_bytes) > 72:
        logger.info(f"Password exceeds 72 bytes, truncating...")
        # Convert to bytes, truncate, then safely decode
        pwd_bytes = pwd_bytes[:72]
        logger.info(f"Truncated bytes length: {len(pwd_bytes)}")
        # Find the last valid UTF-8 sequence boundary
        try:
            result = pwd_bytes.decode('utf-8')
            logger.info(f"Successfully decoded truncated password: {result}")
            return result
        except UnicodeDecodeError:
            # If truncation broke a multi-byte character, remove the last byte
            result = pwd_bytes[:-1].decode('utf-8', 'ignore')
            logger.info(f"Fixed broken UTF-8, result: {result}")
            return result
    
    logger.info(f"Password within 72 bytes, returning original")
    return password

def hash_password(password: str) -> str:
    logger.info(f"Hash input: {password}")
    logger.info(f"Hash input length: {len(password)}")
    logger.info(f"Hash input type: {type(password)}")
    safe_password = get_safe_password(password)
    logger.info(f"Safe password: {safe_password}")
    logger.info(f"Safe password length: {len(safe_password)}")
    logger.info(f"Safe password bytes length: {len(safe_password.encode('utf-8'))}")
    return pwd_context.hash(safe_password)

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
