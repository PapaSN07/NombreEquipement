# Suivi des équipements — Senelec

Page de connexion + CRUD des nombres d'équipements par type et par période.

- **Backend** : FastAPI · SQLAlchemy · JWT HS256 · passlib 1.7.4 + bcrypt 3.2.2 (pin exact)
- **Base** : SQLite par défaut (`app.db`, créé au premier lancement) — compatible SQL Server
- **Frontend** : Angular 21 (composants standalone, zone.js)

## Démarrage avec Docker Compose (SQL Server 2022)

Prérequis : Docker + Docker Compose. Le dépôt contient :

| Service | Rôle | Port |
|---|---|---|
| `sqlserver` | `mcr.microsoft.com/mssql/server:2022-latest`, données dans le volume `mssql-data` | 1433 |
| `db-init` | crée la base `IndicateursTransportDistribution` et ses 2 tables (`db/init.sql`) si absentes, puis s'arrête | — |
| `backend` | FastAPI + pilote ODBC 18 + pyodbc | 8000 |
| `frontend` | build Angular servi par nginx, qui relaie `/api` vers le backend | 4200 |

```bash
cp .env.example .env          # changez MSSQL_SA_PASSWORD, JWT_SECRET, ADMIN_PASSWORD
docker compose up -d --build
# Application : http://localhost:4200   ·   API : http://localhost:8000/docs
docker compose logs -f backend   # suivre le démarrage
docker compose down              # arrêter (les données restent dans le volume)
docker compose down -v           # arrêter ET effacer la base
```

Premier démarrage : SQL Server met ~20-30 s à être prêt ; le backend attend que `db-init`
ait terminé. Les 13 types, les 32 saisies et le compte admin sont ensuite insérés (tables vides).

**Seulement la base dans Docker** (développement avec `uvicorn --reload` / `ng serve`) :
```bash
docker compose up -d sqlserver db-init
# backend/.env :
# DATABASE_URL=mssql+pyodbc://sa:Senelec_Sql2026!@localhost:1433/IndicateursTransportDistribution?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes
pip install -r requirements-mssql.txt   # + « ODBC Driver 18 for SQL Server » installé sur la machine
```

Notes :
- Mot de passe SA : 8 caractères minimum avec majuscule, minuscule, chiffre et symbole, sinon
  SQL Server refuse de démarrer. Évitez `@ : / ? #`, car il est inséré dans l'URL de connexion.
- L'image SQL Server est en `linux/amd64` : sur un Mac Apple Silicon, activez « Use Rosetta »
  dans Docker Desktop.

## Démarrage sans Docker (SQLite)

Prérequis : Python 3.11, Node 22.

```bash
# Backend
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows : .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # puis changez JWT_SECRET et ADMIN_PASSWORD
uvicorn app.main:app --reload      # http://localhost:8000  (doc : /docs)

# Frontend (autre terminal)
cd frontend
npm install
ng serve                           # http://localhost:4200  (ou npx ng serve)
```

Le frontend appelle `/api/...` ; en dev, `proxy.conf.json` redirige vers `http://localhost:8000`.

**Compte par défaut** : `admin@senelec.sn` / `Senelec@2026` (valeurs de `.env`).
Il n'est créé que si la table `Utilisateur` est vide — changer `ADMIN_PASSWORD`
après coup ne modifie pas un compte déjà créé (supprimez `app.db` en dev).

## Données initiales (seed idempotent)

Au démarrage, chaque table n'est remplie que si elle est vide :
- `Utilisateur` : le compte admin (hash bcrypt) ;
- `TypeEquipement` : les 13 types du fichier `TypeEquipement.xlsx` ;
- `NombreEquipement_TypeEquip` : les 32 saisies 2023 → 2026 du fichier Excel.

## Règle métier — pas de chevauchement

Plusieurs périodes par type sont autorisées, **à condition de ne pas se chevaucher**.
Deux périodes `[d1, f1]` et `[d2, f2]` du même type se chevauchent si `d1 ≤ f2` et `d2 ≤ f1`
(bornes incluses : une période finissant le 31/12 et une autre commençant le 01/01 sont valides).

- Création/modification en conflit → HTTP 409 avec la période existante ; l'interface propose
  alors « Modifier l'entrée existante ».
- En modification, la ligne elle-même est exclue du contrôle.
- `date_fin ≥ date_debut` et `nombre ≥ 0` sont aussi vérifiés (HTTP 422).

## Passage à SQL Server (IndicateursTransportDistribution)

Les modèles reprennent **exactement** les noms des tables et colonnes existantes :

| Table SQL Server | Colonnes |
|---|---|
| `TypeEquipement` | `IDTypeEquipement` (bigint, PK non IDENTITY), `typeequipement` (varchar 50) |
| `NombreEquipement_TypeEquip` | `IDNombreEquipement_TypeEquip` (bigint IDENTITY), `IDTypeEquipement`, `Nombre_Equipements`, `DateDebut`, `DateFin` |
| `Utilisateur` | créée par l'application (n'existe pas encore dans la base) |

Avec Docker Compose, tout cela est automatique (voir plus haut). Sur une base existante :

Pour basculer :
1. `pip install pyodbc` et installer « ODBC Driver 18 for SQL Server » ;
2. dans `.env` :
   `DATABASE_URL=mssql+pyodbc://sa:MotDePasse@localhost:1433/IndicateursTransportDistribution?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes`

`create_all()` ne crée que les tables absentes : les tables existantes et leurs données ne
sont pas touchées, et comme elles sont déjà remplies, seul le compte admin est ajouté.
Aucune clé étrangère n'existe dans le schéma SQL Server : l'API vérifie elle-même que le type existe.

## API

| Méthode | Route | Auth |
|---|---|---|
| POST | `/api/auth/login` `{email, mot_de_passe}` → `{access_token}` | — |
| GET | `/api/auth/me` | Bearer |
| GET | `/api/types-equipement` | Bearer |
| GET / POST | `/api/equipements` | Bearer |
| PUT / DELETE | `/api/equipements/{id}` | Bearer |

## Structure

```
backend/
  app/
    api/
      deps.py                 get_db, get_current_user (JWT)
      router.py               regroupe les routes sous /api (+ /api/health)
      routes/                 auth.py, types_equipement.py, equipements.py
    core/
      config.py               paramètres (.env)
      security.py             bcrypt (passlib), création / décodage JWT
    db/
      base.py                 Base déclarative SQLAlchemy
      session.py              engine, SessionLocal
      init_db.py              create_all (tables absentes uniquement)
    models/                   type_equipement.py, equipement.py, utilisateur.py
    schemas/                  auth.py, type_equipement.py, equipement.py
    services/                 auth_service.py, type_equipement_service.py,
                              equipement_service.py (CRUD + règle de chevauchement)
    initial_data.py           seed idempotent (admin + données Excel) — `python -m app.initial_data`
    middleware.py             CORS + log des requêtes
    main.py                   app FastAPI (init au démarrage, middleware, routes)
  Dockerfile, .dockerignore, .env.example, requirements*.txt

frontend/src/app/
  components/                 navbar, equipement-form, equipement-table
  guards/                     auth.guard.ts (authGuard, guestGuard)
  init/                       app.init.ts (locale fr + vérification de session au démarrage)
  interceptors/               auth.interceptor.ts (JWT + 401 → login)
  models/                     auth, equipement, type-equipement
  pages/                      login, equipements
  services/                   auth, equipement, type-equipement, api-error
  app.config.ts, app.routes.ts
```

Pas d'Alembic pour l'instant (exclu par le cahier des charges) : `create_all()` suffit.
