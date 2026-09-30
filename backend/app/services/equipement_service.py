"""Logique métier des saisies d'équipements.

Règle : plusieurs périodes par type sont autorisées, sans chevauchement.
Deux périodes [d1, f1] et [d2, f2] se chevauchent si d1 <= f2 et d2 <= f1
(bornes incluses : 31/12 puis 01/01 ne se chevauchent pas).
En modification, la ligne elle-même est exclue du contrôle.
"""
from sqlalchemy import select
from sqlalchemy.orm import Session, contains_eager

from app.models import Equipement, TypeEquipement
from app.schemas import EquipementIn, EquipementOut
from app.services import type_equipement_service


class EquipementError(Exception):
    """Erreur métier, traduite en réponse HTTP par la couche API."""

    def __init__(self, message: str, status_code: int):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def to_out(e: Equipement) -> EquipementOut:
    out = EquipementOut.model_validate(e)
    out.type_equipement_nom = e.type_equipement.nom if e.type_equipement else None
    return out


def list_equipements(db: Session) -> list[Equipement]:
    return list(
        db.scalars(
            select(Equipement)
            .join(Equipement.type_equipement)
            .options(contains_eager(Equipement.type_equipement))
            .order_by(Equipement.date_debut.desc(), TypeEquipement.nom)
        ).all()
    )


def find_chevauchement(db: Session, data: EquipementIn, exclude_id: int | None = None) -> Equipement | None:
    q = select(Equipement).where(
        Equipement.type_equipement_id == data.type_equipement_id,
        Equipement.date_debut <= data.date_fin,
        Equipement.date_fin >= data.date_debut,
    )
    if exclude_id is not None:
        q = q.where(Equipement.id != exclude_id)
    return db.scalars(q).first()


def _valider(
    db: Session,
    data: EquipementIn,
    exclude_id: int | None = None
) -> None:

    # Vérification de la cohérence des dates
    if data.date_debut > data.date_fin:
        raise EquipementError(
            "La date de début doit être antérieure ou égale à la date de fin.",
            422,
        )

    if type_equipement_service.get_type(db, data.type_equipement_id) is None:
        raise EquipementError("Type d'équipement inconnu.", 422)

    conflit = find_chevauchement(db, data, exclude_id)

    if conflit:
        raise EquipementError(
            f"Ce type d'équipement a déjà une période enregistrée qui chevauche celle-ci "
            f"(du {conflit.date_debut:%d/%m/%Y} au {conflit.date_fin:%d/%m/%Y}). "
            f"Modifiez l'entrée existante ou choisissez d'autres dates.",
            409,
        )

def _get_or_404(db: Session, equipement_id: int) -> Equipement:
    e = db.get(Equipement, equipement_id)
    if e is None:
        raise EquipementError("Équipement introuvable.", 404)
    return e


def create(db: Session, data: EquipementIn) -> Equipement:
    _valider(db, data)
    e = Equipement(**data.model_dump())
    db.add(e)
    db.commit()
    db.refresh(e)
    return e


def update(db: Session, equipement_id: int, data: EquipementIn) -> Equipement:
    e = _get_or_404(db, equipement_id)
    _valider(db, data, exclude_id=equipement_id)
    for k, v in data.model_dump().items():
        setattr(e, k, v)
    db.commit()
    db.refresh(e)
    return e


def delete(db: Session, equipement_id: int) -> None:
    e = _get_or_404(db, equipement_id)
    db.delete(e)
    db.commit()
