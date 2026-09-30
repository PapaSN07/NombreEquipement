from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field

Role = Literal["admin", "utilisateur"]


class UtilisateurCreate(BaseModel):
    email: EmailStr
    mot_de_passe: str = Field(min_length=8, max_length=128)
    role: Role = "utilisateur"


class UtilisateurUpdate(BaseModel):
    role: Role
    actif: bool
    mot_de_passe: str | None = Field(default=None, min_length=8, max_length=128)


class UtilisateurOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    role: str
    actif: bool