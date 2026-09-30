from datetime import date

from pydantic import BaseModel, ConfigDict, Field, model_validator


class EquipementIn(BaseModel):
    type_equipement_id: int
    date_debut: date
    date_fin: date
    nombre: int = Field(ge=0)

    @model_validator(mode="after")
    def check_dates(self):
        if self.date_fin < self.date_debut:
            raise ValueError("La date de fin doit être postérieure ou égale à la date de début.")
        return self


class EquipementOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    type_equipement_id: int
    type_equipement_nom: str | None = None
    date_debut: date | None
    date_fin: date | None
    nombre: int | None
