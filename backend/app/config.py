from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = (
        "postgresql+psycopg://bnb_user:bnb_password@localhost:5432/built_not_bought"
    )

    secret_key: str = "change-me-to-a-long-random-secret"
    access_token_expire_minutes: int = 60

    cors_origins: str = "http://localhost:5173"
    
    upload_dir: str = "storage/local"
    max_upload_size_mb: int = 5

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [
            origin.strip() for origin in self.cors_origins.split(",") if origin.strip()
        ]
    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

settings = Settings()
