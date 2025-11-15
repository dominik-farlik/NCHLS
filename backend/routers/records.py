from bson import ObjectId
from fastapi import APIRouter, Body, Query, HTTPException
from bson.json_util import dumps
import json

from models.record import Record
from db.repo import insert_record, fetch_records, fetch_record, db_update_record

router = APIRouter()

@router.get("")
async def list_records(department_name: str | None = Query(default=None)):
    filter_ = {"location_name": department_name} if department_name else {}
    cursor = fetch_records(filter_)
    return json.loads(dumps(list(cursor)))

@router.post("")
async def add_record(record: Record = Body(...)):
    inserted_id = insert_record(record.model_dump())
    return {"inserted_id": str(inserted_id)}

@router.get("/{record_id}")
async def get_record(record_id: str):
    if not ObjectId.is_valid(record_id):
        raise HTTPException(status_code=400, detail="Neplatné ID záznamu.")
    record = fetch_record(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Záznam nenalezen.")
    record["id"] = str(record.pop("_id"))
    return json.loads(dumps(record))

@router.put("")
async def update_record(substance: Record = Body(...)):
    db_update_record(substance)
    return {"status": "ok"}