from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models import Utilisateur
from app.schemas.utilisateur import UtilisateurCreate, UtilisateurUpdate


class UtilisateurError(Exception):
    def __init__(self, message: str, status_code: int):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def list_users(db: Session) -> list[Utilisateur]:
    return list(db.scalars(select(Utilisateur).order_by(Utilisateur.email)).all())


def _get_or_404(db: Session, user_id: int) -> Utilisateur:
    u = db.get(Utilisateur, user_id)
    if u is None:
        raise UtilisateurError("Utilisateur introuvable.", 404)
    return u


def _nb_admins_actifs(db: Session) -> int:
    return db.scalar(
        select(func.count()).select_from(Utilisateur).where(Utilisateur.role == "admin", Utilisateur.actif.is_(True))
    ) or 0


def create_user(db: Session, data: UtilisateurCreate) -> Utilisateur:
    """Construit l'utilisateur avec la gestion de la source (local ou ldap)"""
    user = Utilisateur(
        email=data.email.lower(),
        mot_de_passe_hash=hash_password(data.mot_de_passe) if data.source == "local" else None,
        role=data.role,
        actif=True,
        source=data.source,
    )
    db.add(user)
    db.commit() # Optionnel si géré par le routeur, mais recommandé pour persister l'ID
    db.refresh(user)
    return user


def update(db: Session, user_id: int, data: UtilisateurUpdate, current_id: int) -> Utilisateur:
    u = _get_or_404(db, user_id)
    perd_admin = u.role == "admin" and u.actif and (data.role != "admin" or not data.actif)
    if perd_admin and _nb_admins_actifs(db) <= 1:
        raise UtilisateurError("Impossible : il doit rester au moins un administrateur actif.", 409)
    if user_id == current_id and not data.actif:
        raise UtilisateurError("Vous ne pouvez pas désactiver votre propre compte.", 409)
    u.role, u.actif = data.role, data.actif
    if data.mot_de_passe:
        u.mot_de_passe_hash = hash_password(data.mot_de_passe)
    db.commit()
    db.refresh(u)
    return u


def delete(db: Session, user_id: int, current_id: int) -> None:
    u = _get_or_404(db, user_id)
    if user_id == current_id:
        raise UtilisateurError("Vous ne pouvez pas supprimer votre propre compte.", 409)
    if u.role == "admin" and u.actif and _nb_admins_actifs(db) <= 1:
        raise UtilisateurError("Impossible de supprimer le dernier administrateur.", 409)
    db.delete(u)
    db.commit()