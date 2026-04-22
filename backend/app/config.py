from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Sensible local-dev defaults so the API boots out-of-the-box.
    DATABASE_URL: str = "sqlite:///./phishguard.db"
    REDIS_URL: str | None = None
    GROQ_API_KEY: str | None = None
    GOOGLE_SAFE_BROWSING_API_KEY: str = ""
    CORS_ORIGINS: str = "*"  # comma-separated list, or "*" for dev
    SECRET_KEY: str = "dev-secret-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
