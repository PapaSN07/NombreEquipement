from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Equipement, TypeEquipement
from app.schemas import TypeEquipementIn


class TypeEquipementError(Exception):
    def __init__(self, message: str, status_code: int):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def list_types(db: Session) -> list[TypeEquipement]:
    return list(db.scalars(select(TypeEquipement).order_by(TypeEquipement.nom)).all())


def get_type(db: Session, type_id: int) -> TypeEquipement | None:
    return db.get(TypeEquipement, type_id)


def _check_doublon(db: Session, nom: str, exclude_id: int | None = None) -> None:
    q = select(TypeEquipement).where(func.lower(TypeEquipement.nom) == nom.lower())
    if exclude_id is not None:
        q = q.where(TypeEquipement.id != exclude_id)
    if db.scalars(q).first():
        raise TypeEquipementError("Ce type d'équipement existe déjà.", 409)


def _get_or_404(db: Session, type_id: int) -> TypeEquipement:
    t = db.get(TypeEquipement, type_id)
    if t is None:
        raise TypeEquipementError("Type d'équipement introuvable.", 404)
    return t


def create(db: Session, data: TypeEquipementIn) -> TypeEquipement:
    _check_doublon(db, data.nom)
    # PK non IDENTITY : on calcule le prochain id
    next_id = (db.scalar(select(func.max(TypeEquipement.id))) or 0) + 1
    t = TypeEquipement(id=next_id, nom=data.nom)
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


def update(db: Session, type_id: int, data: TypeEquipementIn) -> TypeEquipement:
    t = _get_or_404(db, type_id)
    _check_doublon(db, data.nom, exclude_id=type_id)
    t.nom = data.nom
    db.commit()
    db.refresh(t)
    return t


def delete(db: Session, type_id: int) -> None:
    t = _get_or_404(db, type_id)
    used = db.scalar(select(func.count()).select_from(Equipement).where(Equipement.type_equipement_id == type_id))
    if used:
        raise TypeEquipementError(f"Suppression impossible : {used} saisie(s) d'équipement utilisent ce type.", 409)
    db.delete(t)
    db.commit()