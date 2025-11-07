from pathlib import Path
from bson import ObjectId
from fastapi import FastAPI, Body, UploadFile, File, HTTPException, APIRouter
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from pymongo.errors import DuplicateKeyError
from starlette.responses import JSONResponse, FileResponse
import shutil
import logging
from bson.json_util import dumps
import json
import os

from models import Record, Substance, SubstanceUpdate
from db import insert_record, insert_substance, add_safety_sheet, fetch_substances, fetch_substances_names, get_db, \
    fetch_records, fetch_departments
from property_lists import UNITS, PROPERTIES, PHYSICAL_FORMS

app = FastAPI()
api = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# --------------------------
# Health
# --------------------------
@api.get("")
async def read_root():
    return {"message": "FastAPI is running!"}


# --------------------------
# Dictionaries / lists
# --------------------------
@api.get("/units")
async def get_units():
    return UNITS


@api.get("/properties")
async def get_properties():
    return list(PROPERTIES.keys())


@api.get("/physical_forms")
async def get_physical_forms():
    return PHYSICAL_FORMS


@api.get("/departments")
async def get_departments():
    cursor = fetch_departments()
    return JSONResponse(content=json.loads(dumps(cursor)))


@api.get("/categories/{prop}")
async def get_categories(prop: str):
    if prop not in PROPERTIES:
        raise HTTPException(status_code=404, detail=f"Property '{prop}' not found")
    return sorted(list(PROPERTIES[prop].get("categories", [])))


@api.get("/exposure_routes/{prop}")
async def get_exposure_routes(prop: str):
    if prop not in PROPERTIES:
        raise HTTPException(status_code=404, detail=f"Property '{prop}' not found")
    return sorted(list(PROPERTIES[prop].get("exposure_routes", [])))


# --------------------------
# Substances
# --------------------------
@api.get("/substances")
async def list_substances():
    cursor = fetch_substances()
    return JSONResponse(content=json.loads(dumps(cursor)))


@api.get("/substances/names")
async def list_substance_names():
    return fetch_substances_names()


@api.post("/add_substance")
async def add_substance(substance: Substance = Body(...)):
    logger.info(f"Adding substance {substance}")
    inserted_id = insert_substance(substance.model_dump())
    return {"id": str(inserted_id)}


@api.put("/substances/{substance_id}")
async def update_substance(substance_id: str, payload: SubstanceUpdate = Body(...)):
    if not ObjectId.is_valid(substance_id):
        raise HTTPException(status_code=400, detail="Neplatné ID látky.")
    oid = ObjectId(substance_id)

    update_doc = payload.model_dump(exclude_unset=True)
    if not update_doc:
        raise HTTPException(status_code=400, detail="Nebyly poskytnuty žádné změny.")
    update_doc.pop("_id", None)

    if "name" in update_doc and update_doc["name"]:
        exists = get_db().substances.find_one({"name": update_doc["name"], "_id": {"$ne": oid}})
        if exists:
            raise HTTPException(status_code=400, detail=f"Látka s názvem {update_doc['name']} již existuje.")

    try:
        result = get_db().substances.update_one({"_id": oid}, {"$set": jsonable_encoder(update_doc)})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Látka nenalezena.")
        updated = get_db().substances.find_one({"_id": oid})
        updated["id"] = str(updated.pop("_id"))
        return {"updated": True, "substance": updated}
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="Látka s tímto názvem již existuje.")


@api.get("/substances/{substance_id}")
async def get_substance(substance_id: str):
    if not ObjectId.is_valid(substance_id):
        raise HTTPException(status_code=400, detail="Neplatné ID látky.")
    doc = get_db().substances.find_one({"_id": ObjectId(substance_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Látka nenalezena.")
    doc["id"] = str(doc.pop("_id"))
    return doc


# --------------------------
# Files
# --------------------------
@api.post("/{substance_id}/add_safety_sheet")
async def save_safety_sheet(substance_id: str, safety_sheet: UploadFile = File(...)):
    try:
        extension = Path(safety_sheet.filename).suffix or ".pdf"
        file_path = UPLOAD_DIR / f"{substance_id}{extension}"
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(safety_sheet.file, buffer)
        logger.info(f"Adding safety_sheet for {substance_id}")
        add_safety_sheet(substance_id)
        return JSONResponse(content={"message": "Safety sheet uploaded successfully", "file_path": str(file_path)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {e}")


@api.get("/safety_sheet/{substance_id}")
async def get_safety_sheet(substance_id: str):
    pdf_path = os.path.join(UPLOAD_DIR, f"{substance_id}.pdf")
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail=f"Soubor {pdf_path} nenalezen")
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{substance_id}.pdf"'}
    )


# --------------------------
# Records
# --------------------------
@api.get("/records")
async def list_records():
    cursor = fetch_records()
    return JSONResponse(content=json.loads(dumps(cursor)))


@api.post("/add_record")
async def add_record(record: Record = Body(...)):
    logger.info(f"Adding record {record}")
    inserted_id = insert_record(record.model_dump())
    return {"inserted_id": str(inserted_id)}


# Finally, register the router
app.include_router(api)
