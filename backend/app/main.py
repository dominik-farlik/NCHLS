import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.core.auth import get_current_subject
from app.core.config import settings
from app.db.connection import create_client, init_indexes
from app.routers import substances, auth, dictionaries, health, records


@asynccontextmanager
async def lifespan(app: FastAPI):
    db_enabled = os.getenv("DB_ENABLED", "1") == "1"

    if db_enabled:
        client = create_client()
        db = client.nchls

        client.admin.command("ping")

        init_indexes(db)

        app.state.mongo_client = client
        app.state.db = db
    else:
        app.state.mongo_client = None
        app.state.db = None

    yield

    client = getattr(app.state, "mongo_client", None)
    if client is not None:
        client.close()


app = FastAPI(title="Chem API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(settings.UPLOAD_DIR)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

AuthDep = Depends(get_current_subject)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(dictionaries.router, prefix="/api", tags=["dictionaries"], dependencies=[AuthDep])
app.include_router(substances.router, prefix="/api/substances", tags=["substances"], dependencies=[AuthDep])
app.include_router(records.router, prefix="/api/records", tags=["records"], dependencies=[AuthDep])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])