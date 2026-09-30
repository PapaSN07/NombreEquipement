from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Unicode, UnicodeText
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ImportFichier(Base):
    """Fichiers Excel déjà importés depuis le dossier data/.

    L'empreinte (SHA-256 du contenu) permet d'ignorer au démarrage un fichier
    qui n'a pas changé depuis son dernier import.
    Table propre à l'application (créée automatiquement, comme Utilisateur).
    """

    __tablename__ = "ImportFichier"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nom_fichier: Mapped[str] = mapped_column(Unicode(255), unique=True, nullable=False)
    empreinte: Mapped[str] = mapped_column(String(64), nullable=False)
    date_import: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    resume: Mapped[str | None] = mapped_column(UnicodeText)
