from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password, verify_password
from app.models import Utilisateur
from app.services import ldap_service


def get_by_email(db: Session, email: str) -> Utilisateur | None:
    return db.scalar(select(Utilisateur).where(Utilisateur.email == email.lower()))


def authenticate(db: Session, email: str, mot_de_passe: str) -> Utilisateur | None:
    user = get_by_email(db, email)
    if user is None or not user.actif:
        return None

    if user.source == "ldap":
        ok = settings.LDAP_ENABLED and ldap_service.authenticate(user.email, mot_de_passe)
    else:
        ok = bool(user.mot_de_passe_hash) and verify_password(mot_de_passe, user.mot_de_passe_hash)

    return user if ok else None


def create_user(db: Session, email: str, mot_de_passe: str) -> Utilisateur:
    user = Utilisateur(email=email.lower(), mot_de_passe_hash=hash_password(mot_de_passe))
    db.add(user)
    return user