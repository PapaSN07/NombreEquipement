from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_admin
from app.schemas import TypeEquipementIn, TypeEquipementOut
from app.services import type_equipement_service as svc
from app.services.type_equipement_service import TypeEquipementError

router = APIRouter(prefix="/types-equipement", tags=["types-equipement"])


def _http(e: TypeEquipementError) -> HTTPException:
    return HTTPException(e.status_code, e.message)


@router.get("", response_model=list[TypeEquipementOut], dependencies=[Depends(get_current_user)])
def list_types(db: Session = Depends(get_db)):
    return svc.list_types(db)


@router.post("", response_model=TypeEquipementOut, status_code=201, dependencies=[Depends(require_admin)])
def create_type(data: TypeEquipementIn, db: Session = Depends(get_db)):
    try:
        return svc.create(db, data)
    except TypeEquipementError as e:
        raise _http(e)


@router.put("/{type_id}", response_model=TypeEquipementOut, dependencies=[Depends(require_admin)])
def update_type(type_id: int, data: TypeEquipementIn, db: Session = Depends(get_db)):
    try:
        return svc.update(db, type_id, data)
    except TypeEquipementError as e:
        raise _http(e)


@router.delete("/{type_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_type(type_id: int, db: Session = Depends(get_db)):
    try:
        svc.delete(db, type_id)
    except TypeEquipementError as e:
        raise _http(e)