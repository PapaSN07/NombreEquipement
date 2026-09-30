from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.security import create_access_token
from app.schemas import LoginRequest, TokenResponse
from app.services import auth_service
from app.models import Utilisateur
from app.schemas.utilisateur import UtilisateurOut


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = auth_service.authenticate(db, data.email, data.mot_de_passe)
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Email ou mot de passe incorrect.")
    return TokenResponse(access_token=create_access_token(user.email), email=user.email)

@router.get("/me", response_model=UtilisateurOut)
def me(user: Utilisateur = Depends(get_current_user)):
    return user