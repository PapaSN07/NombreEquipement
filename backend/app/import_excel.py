"""Import manuel des fichiers Excel (sans redémarrer l'API).

Usage (depuis le dossier backend/) :
    python -m app.import_excel            # fichiers nouveaux ou modifiés du dossier data/
    python -m app.import_excel --force    # relit tous les fichiers du dossier data/
    python -m app.import_excel --types chemin/Types.xlsx --nombres chemin/Nombres.xlsx

Avec Docker (le dossier backend/data est monté dans le conteneur) :
    docker compose exec backend python -m app.import_excel
"""
import argparse
import logging
import sys

from app.core.config import settings
from app.db.init_db import create_tables
from app.db.session import SessionLocal
from app.services.excel_import_service import ExcelFormatError, importer_dossier, importer_excel


def main() -> int:
    parser = argparse.ArgumentParser(description="Import des fichiers Excel d'équipements")
    parser.add_argument("--force", action="store_true", help="relire aussi les fichiers inchangés du dossier")
    parser.add_argument("--types", help="importer ce fichier de types précis")
    parser.add_argument("--nombres", help="importer ce fichier de saisies précis")
    args = parser.parse_args()

    logging.basicConfig(level=logging.WARNING)
    create_tables()
    with SessionLocal() as db:
        # Fichiers précis
        if args.types or args.nombres:
            try:
                rapport = importer_excel(db, args.types, args.nombres)
            except (FileNotFoundError, ExcelFormatError) as e:
                print(f"Erreur : {e}", file=sys.stderr)
                return 1
            print(rapport.resume())
            return 0

        # Dossier data/
        resultats = importer_dossier(db, settings.DATA_DIR, forcer=args.force)
    if not resultats:
        print(f"Aucun fichier nouveau ou modifié dans {settings.DATA_DIR}/ (--force pour tout relire).")
    for nom, resume in resultats:
        print(f"== {nom}\n{resume}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
