import csv
from datetime import datetime
from io import StringIO

from fastapi import APIRouter, Body, HTTPException, UploadFile, Query
from fastapi.responses import StreamingResponse
from pathlib import Path
from fastapi.responses import FileResponse
from bson import ObjectId

from core.config import settings
from db.records import fetch_substance_departments, fetch_amount_sum_substance
from models.substance import Substance
from db.substances import insert_substance, fetch_substances, fetch_substance, db_update_substance, fetch_safety_sheet, db_delete_substance
from utils.substances import get_substance_max_tons, get_substance_departments

router = APIRouter()


@router.get("")
async def list_substances(department_name: str | None = Query(default=None), year: int | None = Query(default=None)):
    filter_ = {}
    if department_name:
        filter_["location_name"] = department_name
    if year is not None:
        filter_["year"] = year

    cursor = fetch_substances(filter_)
    substances = list(cursor)

    for substance in substances:
        substance["substance_id"] = str(substance.pop("_id"))
        substance["departments"] = get_substance_departments(substance["substance_id"])
        substance["max_tons"] = get_substance_max_tons(substance["substance_id"])

    return substances


@router.get("/export.csv")
async def export_substances_csv(
    department_name: str | None = Query(default=None),
    year: int | None = Query(default=None),
):
    filter_ = {}
    if department_name:
        filter_["location_name"] = department_name
    if year is not None:
        filter_["year"] = year

    substances = fetch_substances(filter_ if filter_ else None)

    output = StringIO()
    writer = csv.writer(output, delimiter=";")

    writer.writerow([
        "Název",
        "Směs / látka",
        "Fyzikální forma",
        "Doplňky formy",
        "Vlastnosti",
        "Kategorie nebezpečnosti",
        "Max (t)",
        "EC50",
        "Oddělení",
    ])

    for s in substances:
        writer.writerow([
            s.get("name", ""),
            s.get("substance_mixture", ""),
            s.get("physical_form", ""),
            ", ".join(s.get("form_addition", []) or []),
            ", ".join(
                f"{p.get('name', '')} {p.get('category', '')}"
                for p in (s.get("properties") or [])
            ),
            s.get("danger_category", ""),
            get_substance_max_tons(str(s["_id"])),
            s.get("water_toxicity_EC50", ""),
            ", ".join(get_substance_departments(str(s["_id"]))),
        ])

    output.seek(0)

    ts = datetime.now().strftime("%Y-%m-%d_%H-%M")
    filename = f"substances_{ts}.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )


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