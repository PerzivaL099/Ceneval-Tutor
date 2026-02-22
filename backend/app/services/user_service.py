# backend/app/services/user_service.py
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
# Importamos la función de hash
from app.core.security import get_password_hash

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    # SEGURIDAD: Transformamos el password plano en un hash irreversible
    hashed_password = get_password_hash(user.password)
    
    db_user = User(
        email=user.email,
        hashed_password=hashed_password # Guardamos el hash, no el password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user