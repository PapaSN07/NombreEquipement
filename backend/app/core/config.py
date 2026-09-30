from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    PROJECT_NAME: str = "Suivi des équipements — Senelec"
    API_PREFIX: str = "/api"

    DATABASE_URL: str = "sqlite:///./app.db"

    JWT_SECRET: str = "changez-moi"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 480

    ADMIN_EMAIL: str = "admin@senelec.sn"
    ADMIN_PASSWORD: str = "Senelec@2026"

    CORS_ORIGINS: str = "http://localhost:4200"

    # Dossier des fichiers Excel parcouru au démarrage (relatif au dossier backend/)
    DATA_DIR: str = "data"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
