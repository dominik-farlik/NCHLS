from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

from app.dependencies import SessionDep

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/ready")
def ready(db: SessionDep):
    try:
        db.execute(text("SELECT 1"))
    except OperationalError:
        raise HTTPException(status_code=503, detail="DB not ready")

    return {"status": "ready"}
