"""Application settings loaded from the environment via pydantic-settings."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Typed application configuration.

    Values are read from environment variables (case-insensitive) or a .env
    file. Add new config here rather than reaching for os.getenv in the code.
    """

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    base_url: str = "http://localhost:8004"

    # Origins allowed to call the API from a browser (the Angular frontend).
    # Override in .env with a JSON list, e.g. CORS_ORIGINS=["https://trimly.app"]
    cors_origins: list[str] = ["http://localhost:4200"]


def get_settings() -> Settings:
    """Return application settings, read fresh from the environment."""
    return Settings()
