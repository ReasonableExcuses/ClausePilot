import os
from pydantic import BaseModel


class Settings(BaseModel):
    PROJECT_NAME: str = "ClausePilot"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./clausepilot.db")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "none")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-3.5-turbo")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "uploads")))
    DATA_DIR: str = os.getenv("DATA_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data")))


settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.DATA_DIR, exist_ok=True)
