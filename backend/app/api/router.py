from fastapi import APIRouter

from app.api.routes import auth, equipements, types_equipement, utilisateurs

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(types_equipement.router)
api_router.include_router(equipements.router)
api_router.include_router(utilisateurs.router)


@api_router.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
