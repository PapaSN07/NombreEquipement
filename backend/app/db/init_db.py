from app.db.base import Base
from app.db.session import engine
import app.models  # noqa: F401 — enregistre les modèles sur Base.metadata


def create_tables() -> None:
    """Crée uniquement les tables absentes (checkfirst).

    Sur SQL Server, les tables TypeEquipement et NombreEquipement_TypeEquip
    existantes ne sont pas touchées ; seule Utilisateur est ajoutée si besoin.
    """
    Base.metadata.create_all(bind=engine)
