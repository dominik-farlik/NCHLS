from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from models import Record, Unit, Substance
from db import insert_record, insert_substance
import logging

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

@app.get("/")
def read_root():
    return {"message": "FastAPI is running!"}

@app.get("/units")
def read_root():
    return [unit.value for unit in Unit]

@app.post("/add_substance")
def add_record(substance: Substance = Body(...)):
    logger.info(f"Adding substance {substance}")
    inserted_id = insert_substance(substance.model_dump())
    return {"inserted_id": str(inserted_id)}

@app.post("/add_record")
def add_record(record: Record = Body(...)):
    logger.info(f"Adding record {record}")
    inserted_id = insert_record(record.model_dump())
    return {"inserted_id": str(inserted_id)}
