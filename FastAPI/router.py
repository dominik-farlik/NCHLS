from pathlib import Path
from fastapi import FastAPI, Body, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse, FileResponse
import shutil
import logging
from bson.json_util import dumps
import json
import os

from models import Record, Substance
from db import insert_record, insert_substance, add_safety_sheet, fetch_substances, fetch_substances_names
from property_lists import UNITS, PROPERTIES, PHYSICAL_FORMS

app = FastAPI()
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

@app.get("/")
async def read_root():
    return {"message": "FastAPI is running!"}

@app.get("/units")
async def get_units():
    return UNITS

@app.get("/properties")
async def get_properties():
    return list(PROPERTIES.keys())

@app.get("/physical_forms")
async def get_physical_forms():
    return PHYSICAL_FORMS

from fastapi import HTTPException

@app.get("/categories/{property}")
async def get_categories(property: str):
    if property not in PROPERTIES:
        raise HTTPException(status_code=404, detail=f"Property '{property}' not found")
    return sorted(list(PROPERTIES[property].get("categories", [])))


@app.get("/exposure_routes/{property}")
async def get_exposure_routes(property: str):
    if property not in PROPERTIES:
        raise HTTPException(status_code=404, detail=f"Property '{property}' not found")
    return sorted(list(PROPERTIES[property].get("exposure_routes", [])))

@app.get("/substances")
async def get_substances():
    cursor = fetch_substances()
    return JSONResponse(content=json.loads(dumps(cursor)))

@app.get("/substances/names")
async def get_substances():
    return fetch_substances_names()

@app.post("/add_substance")
async def add_record(substance: Substance = Body(...)):
    logger.info(f"Adding substance {substance}")
    inserted_id = insert_substance(substance.model_dump())
    return {"id": str(inserted_id)}

from pathlib import Path
import shutil

@app.post("/{substance_id}/add_safety_sheet")
async def save_safety_sheet(substance_id: str, safety_sheet: UploadFile = File(...)):
    try:
        extension = Path(safety_sheet.filename).suffix
        file_path = UPLOAD_DIR / f"{substance_id}{extension}"

        with file_path.open("wb") as buffer:
            shutil.copyfileobj(safety_sheet.file, buffer)

        logger.info(f"Adding safety_sheet for {substance_id}")
        add_safety_sheet(substance_id)
        return JSONResponse(content={"message": "Safety sheet uploaded successfully", "file_path": str(file_path)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {e}")


@app.post("/add_record")
async def add_record(record: Record = Body(...)):
    logger.info(f"Adding record {record}")
    inserted_id = insert_record(record.model_dump())
    return {"inserted_id": str(inserted_id)}

@app.get("/safety_sheet/{substance_id}")
async def get_safety_sheet(substance_id: str):
    pdf_path = os.path.join(UPLOAD_DIR, f"{substance_id}.pdf")
    if not os.path.exists(pdf_path):
        return {"error": f"Soubor {pdf_path} nenalezen"}
    headers = {
        "Content-Disposition": f'inline; filename="{substance_id}.pdf"'
    }
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        headers=headers
    )
