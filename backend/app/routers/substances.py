from pathlib import Path

from fastapi import APIRouter, Body, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlmodel import select

from app.core.config import settings
from app.db.connection import SessionDep
from app.models import Substance
from app.db.substances import (
    insert_substance,
    db_update_substance,
    fetch_safety_sheet,
    db_delete_substance,
)
router = APIRouter()

@router.get("")
async def read_substances(
        session: SessionDep,
        department_name: str | None = None,
        year: int | None = None
        ) -> list[Substance]:
    substances = session.exec(select(Substance)).all()
    return substances

@router.get("/{substance_id}")
async def read_substance(substance_id: int, session: SessionDep) -> Substance:
    substance = session.get(Substance, substance_id)
    if not substance:
        raise HTTPException(status_code=404, detail="Substance not found")
    return substance


@router.post("")
async def add_substance(substance: Substance = Body(...)):
    insert_substance(substance.model_dump())
    return {"status": "ok"}


@router.put("/{substance_id}")
async def update_substance(substance_id: str, substance: Substance = Body(...)):
    db_update_substance(substance_id, substance)
    return {"status": "ok"}


@router.post("/safety_sheet")
async def add_safety_sheet(safety_sheet: UploadFile):
    with open(f"{settings.UPLOAD_DIR}/{safety_sheet.filename}", "wb") as file:
        file.write(await safety_sheet.read())


@router.get("/safety_sheet/{substance_id}")
async def download_safety_sheet(substance_id: str):
    path = fetch_safety_sheet(substance_id)

    if not path:
        raise HTTPException(status_code=404, detail="Bezpečnostní list není evidován.")

    p = Path(path)

    if not p.is_absolute():
        p = Path(settings.UPLOAD_DIR) / p

    if not p.exists() or not p.is_file():
        raise HTTPException(
            status_code=404, detail="Soubor bezpečnostního listu nebyl nalezen na serveru."
        )

    return FileResponse(
        str(p),
        media_type="application/pdf",
        filename=p.name,
        headers={"Content-Disposition": f'inline; filename="{p.name}"'},
    )


@router.delete("/{substance_id}")
async def delete_substance(substance_id: str):
    db_delete_substance(substance_id)
    return {"status": "ok"}
