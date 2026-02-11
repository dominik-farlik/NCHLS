from fastapi import APIRouter, Body, HTTPException, UploadFile
from pathlib import Path
from fastapi.responses import FileResponse
from bson import ObjectId

from constants.unit import to_tons
from core.config import settings
from models.substance import Substance
from db.repo import insert_substance, fetch_substances, fetch_substance, db_update_substance, fetch_safety_sheet, \
    fetch_substance_departments, fetch_amount_sum_substance, db_delete_substance

router = APIRouter()


@router.get("")
async def list_substances():
    cursor = fetch_substances()
    substances = list(cursor)

    for substance in substances:
        substance["substance_id"] = str(substance.pop("_id"))

        departments_docs = list(fetch_substance_departments(substance["substance_id"]))
        substance["departments"] = (
            departments_docs[0]["departments"] if departments_docs else []
        )

        amount_docs = list(fetch_amount_sum_substance(substance["substance_id"]))
        if amount_docs and "unit" in amount_docs[0]:
            total_amount = amount_docs[0]["total_amount"]
            unit = amount_docs[0]["unit"]
            substance["max_tons"] = to_tons(total_amount, unit)
        else:
            substance["max_tons"] = 0

    return substances


@router.get("/{substance_id}")
async def get_substance(substance_id: str):
    if not ObjectId.is_valid(substance_id):
        raise HTTPException(status_code=400, detail="Neplatné ID látky.")
    doc = fetch_substance(substance_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Látka nenalezena.")
    doc["substance_id"] = str(doc.pop("_id"))
    return doc


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
        raise HTTPException(status_code=404, detail="Soubor bezpečnostního listu nebyl nalezen na serveru.")

    return FileResponse(
        str(p),
        media_type="application/pdf",
        filename=p.name,
        headers={"Content-Disposition": f'inline; filename="{p.name}"'}
    )


@router.delete("/{substance_id}")
async def delete_substance(substance_id: str):
    db_delete_substance(substance_id)
    return {"status": "ok"}