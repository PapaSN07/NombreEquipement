from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.types import BigInt

if TYPE_CHECKING:
    from app.models.equipement import Equipement


class TypeEquipement(Base):
    __tablename__ = "TypeEquipement"

    # PK non IDENTITY dans la base SQL Server : l'id est fourni explicitement
    id: Mapped[int] = mapped_column("IDTypeEquipement", BigInt, primary_key=True, autoincrement=False)
    nom: Mapped[str | None] = mapped_column("typeequipement", String(50))

    equipements: Mapped[list["Equipement"]] = relationship(back_populates="type_equipement")
