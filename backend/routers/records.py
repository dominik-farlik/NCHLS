from fastapi import APIRouter, Body, Query
from bson.json_util import dumps
import json

from models.models import Record
from db.repo import insert_record, fetch_records

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
