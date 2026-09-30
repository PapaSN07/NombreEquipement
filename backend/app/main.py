import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import settings
from app.initial_data import init
from app.middleware import setup_middleware

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")


@asynccontextmanager
async def lifespan(_: FastAPI):
    init()  # tables manquantes + seed idempotent
    yield


app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)
setup_middleware(app)
app.include_router(api_router, prefix=settings.API_PREFIX)
