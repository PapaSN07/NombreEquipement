from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator

Role = Literal["admin", "utilisateur"]
Source = Literal["local", "ldap"]


class UtilisateurCreate(BaseModel):
    email: EmailStr
    mot_de_passe: str | None = Field(default=None, min_length=8, max_length=128)
    role: Role = "utilisateur"
    source: Source = "local"

    @model_validator(mode="after")
    def check_mdp(self):
        if self.source == "local" and not self.mot_de_passe:
            raise ValueError("Un mot de passe est obligatoire pour un compte local.")
        return self


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
    source: str