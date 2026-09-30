from collections.abc import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import decode_access_token
from app.db.session import SessionLocal
from app.models import Utilisateur
from app.services import auth_service

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/login")


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Utilisateur:
    email = decode_access_token(token)
    user = auth_service.get_by_email(db, email) if email else None
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session invalide ou expirée.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
def require_admin(user: Utilisateur = Depends(get_current_user)) -> Utilisateur:
    if user.role != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Accès réservé aux administrateurs.")
    return user