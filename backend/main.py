from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from routers import health, dictionaries, substances, records

app = FastAPI(title="Chem API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(settings.UPLOAD_DIR)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(dictionaries.router, prefix="/api", tags=["dictionaries"])
app.include_router(substances.router, prefix="/api/substances", tags=["substances"])
app.include_router(records.router, prefix="/api/records", tags=["records"])
