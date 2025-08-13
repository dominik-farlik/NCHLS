from pathlib import Path

from fastapi import FastAPI, Body, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
import shutil
import logging

from models import Record, Substance
from db import insert_record, insert_substance, add_safety_sheet
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

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

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

@app.get("/categories/{property}")
async def get_categories(property: str):
    return list(PROPERTIES[property]["categories"])

@app.post("/add_substance")
async def add_record(substance: Substance = Body(...)):
    logger.info(f"Adding substance {substance}")
    inserted_id = insert_substance(substance.model_dump())
    return {"id": str(inserted_id)}

@app.post("/{substance_id}/add_safety_sheet")
async def save_safety_sheet(substance_id: str, safety_sheet: UploadFile = File(...)):
    try:
        file_path = UPLOAD_DIR / f"{substance_id}"
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(safety_sheet.file, buffer)
        add_safety_sheet(substance_id)
        return JSONResponse(content={"message": "Safety sheet uploaded successfully", "file_path": str(file_path)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {e}")

@app.post("/add_record")
async def add_record(record: Record = Body(...)):
    logger.info(f"Adding record {record}")
    inserted_id = insert_record(record.model_dump())
    return {"inserted_id": str(inserted_id)}
