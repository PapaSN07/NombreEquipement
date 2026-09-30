from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.schemas import EquipementIn, EquipementOut
from app.services import equipement_service
from app.services.equipement_service import EquipementError

router = APIRouter(prefix="/equipements", tags=["equipements"], dependencies=[Depends(get_current_user)])


def _http(e: EquipementError) -> HTTPException:
    return HTTPException(e.status_code, e.message)


@router.get("", response_model=list[EquipementOut])
def list_equipements(db: Session = Depends(get_db)):
    return [equipement_service.to_out(e) for e in equipement_service.list_equipements(db)]


@router.post("", response_model=EquipementOut, status_code=status.HTTP_201_CREATED)
def create_equipement(data: EquipementIn, db: Session = Depends(get_db)):
    try:
        return equipement_service.to_out(equipement_service.create(db, data))
    except EquipementError as e:
        raise _http(e)


@router.put("/{equipement_id}", response_model=EquipementOut)
def update_equipement(equipement_id: int, data: EquipementIn, db: Session = Depends(get_db)):
    try:
        return equipement_service.to_out(equipement_service.update(db, equipement_id, data))
    except EquipementError as e:
        raise _http(e)


@router.delete("/{equipement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_equipement(equipement_id: int, db: Session = Depends(get_db)):
    try:
        equipement_service.delete(db, equipement_id)
    except EquipementError as e:
        raise _http(e)
