from pathlib import Path

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.routers import substances, dictionaries, health, auth, records
from config import get_settings

app = FastAPI(title="NCHLS API", version="1.0.0")

origins = [
    get_settings().FRONTEND_URL,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(get_settings().UPLOAD_DIR)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(dictionaries.router, prefix="/api", tags=["dictionaries"])
app.include_router(substances.router, prefix="/api/substances", tags=["substances"])
app.include_router(records.router, prefix="/api/records", tags=["records"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
#app.include_router(export_docs.router, prefix="/api/export", tags=["export"], dependencies=[])