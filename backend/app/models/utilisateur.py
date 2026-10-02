from datetime import datetime

from sqlalchemy import DateTime, Integer, String ,Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Utilisateur(Base):
    __tablename__ = "Utilisateur"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    mot_de_passe_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    source: Mapped[str] = mapped_column("Source", String(10), nullable=False, default="local")
    date_creation: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    role: Mapped[str] = mapped_column("Role", String(20), nullable=False, default="utilisateur")
    actif: Mapped[bool] = mapped_column("Actif", Boolean, nullable=False, default=True)
