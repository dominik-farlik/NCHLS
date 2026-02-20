from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ALLOW_ORIGINS: tuple[str, ...] = (
        "http://localhost:5173",
        "http://localhost:3000",
    )

    MONGO_URL: str | None = None
    MONGO_USER: str | None = None
    MONGO_PASSWORD: str | None = None
    MONGO_HOST: str = "localhost"
    MONGO_PORT: int = 27017
    MONGO_AUTH_SOURCE: str = "admin"
    UPLOAD_DIR: str = "/app/uploads"

    model_config = SettingsConfigDict(env_file=".env", env_prefix="")

    @property
    def mongo_dsn(self) -> str:
        if self.MONGO_URL:
            return self.MONGO_URL
        user = self.MONGO_USER or ""
        pwd = self.MONGO_PASSWORD or ""
        auth = f"{user}:{pwd}@" if user or pwd else ""
        return f"mongodb://{auth}{self.MONGO_HOST}:{self.MONGO_PORT}/?authSource={self.MONGO_AUTH_SOURCE}"


settings = Settings()
