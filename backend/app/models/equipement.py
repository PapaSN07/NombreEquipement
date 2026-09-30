from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.types import BigInt

if TYPE_CHECKING:
    from app.models.type_equipement import TypeEquipement


class Equipement(Base):
    """Nombre d'équipements d'un type sur une période."""

    __tablename__ = "NombreEquipement_TypeEquip"

    id: Mapped[int] = mapped_column("IDNombreEquipement_TypeEquip", BigInt, primary_key=True, autoincrement=True)
    type_equipement_id: Mapped[int] = mapped_column(
        "IDTypeEquipement", BigInt, ForeignKey("TypeEquipement.IDTypeEquipement"), nullable=False
    )
    nombre: Mapped[int | None] = mapped_column("Nombre_Equipements", BigInt)
    date_debut: Mapped[date | None] = mapped_column("DateDebut", Date)
    date_fin: Mapped[date | None] = mapped_column("DateFin", Date)

    type_equipement: Mapped["TypeEquipement"] = relationship(back_populates="equipements")
