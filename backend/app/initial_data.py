"""Données initiales — exécuté au démarrage de l'API.

- Compte admin créé si la table Utilisateur est vide.
- Import automatique des fichiers Excel du dossier DATA_DIR (data/) :
  seuls les fichiers nouveaux ou modifiés depuis le dernier démarrage sont lus
  (voir excel_import_service.importer_dossier). Les lignes déjà en base sont
  ignorées, les lignes invalides ou en chevauchement sont signalées dans les logs.
"""
import logging

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.init_db import create_tables
from app.db.session import SessionLocal
from app.models import Utilisateur
from app.services import auth_service
from app.services.excel_import_service import importer_dossier

logger = logging.getLogger(__name__)


def seed(db: Session) -> None:
    if db.scalar(select(func.count()).select_from(Utilisateur)) == 0:
        auth_service.create_user(db, settings.ADMIN_EMAIL, settings.ADMIN_PASSWORD)
        db.commit()
        logger.info("Compte admin créé : %s", settings.ADMIN_EMAIL)

    resultats = importer_dossier(db, settings.DATA_DIR)
    if not resultats:
        logger.info("Import Excel : aucun fichier nouveau ou modifié dans %s/", settings.DATA_DIR)
    for nom, resume in resultats:
        logger.info("Import Excel — %s :\n%s", nom, resume)


def init() -> None:
    create_tables()
    with SessionLocal() as db:
        seed(db)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init()
