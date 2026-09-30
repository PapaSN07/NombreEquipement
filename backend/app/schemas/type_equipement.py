from pydantic import BaseModel, ConfigDict, Field, field_validator


class TypeEquipementIn(BaseModel):
    nom: str = Field(min_length=1, max_length=50)

    @field_validator("nom")
    @classmethod
    def strip_nom(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Le nom est obligatoire.")
        return v


class TypeEquipementOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nom: str | None