from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_admin
from app.schemas.utilisateur import UtilisateurCreate, UtilisateurOut, UtilisateurUpdate
from app.services import utilisateur_service as svc
from app.services.utilisateur_service import UtilisateurError

router = APIRouter(prefix="/utilisateurs", tags=["utilisateurs"])


def _http(e: UtilisateurError) -> HTTPException:
    return HTTPException(e.status_code, e.message)


@router.get("", response_model=list[UtilisateurOut])
def list_users(db: Session = Depends(get_db), _=Depends(require_admin)):
    return svc.list_users(db)


@router.post("", response_model=UtilisateurOut, status_code=201)
def create_user(data: UtilisateurCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    try:
        return svc.create(db, data)
    except UtilisateurError as e:
        raise _http(e)


@router.put("/{user_id}", response_model=UtilisateurOut)
def update_user(user_id: int, data: UtilisateurUpdate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    try:
        return svc.update(db, user_id, data, admin.id)
    except UtilisateurError as e:
        raise _http(e)


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    try:
        svc.delete(db, user_id, admin.id)
    except UtilisateurError as e:
        raise _http(e)