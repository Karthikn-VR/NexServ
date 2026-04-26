from sqlalchemy.orm import Session
from sqlalchemy import text
from .. import models

def get_user_by_email(db: Session, email: str):
    try:
        return db.query(models.User).filter(models.User.email == email).first()
    except Exception:
        db.rollback()
        # Safe fallback for potential schema mismatches
        stmt = text('SELECT id, name, email, password_hash, role, created_at FROM public.users WHERE email = :email LIMIT 1')
        res = db.execute(stmt, {'email': email}).first()
        if not res:
            return None
        return res

def create_user(db: Session, name: str, email: str, password_hash: str, role: str = 'customer'):
    try:
        user = models.User(name=name, email=email, password_hash=password_hash, role=role)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except Exception:
        db.rollback()
        # Safe fallback for potential schema mismatches
        stmt = text(
            'INSERT INTO public.users (name, email, password_hash, role) VALUES (:name, :email, :password_hash, :role) '
            'RETURNING id, name, email, password_hash, role, created_at'
        )
        res = db.execute(stmt, {'name': name, 'email': email, 'password_hash': password_hash, 'role': role}).first()
        db.commit()
        return res
