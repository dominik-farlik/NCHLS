from bson import ObjectId
from fastapi import APIRouter, Body, Query, HTTPException
from bson.json_util import dumps
import json

from models.inventory import ResponsibleEmployee
from models.record import Record
from db.records import insert_record, fetch_records, fetch_record, db_update_record, db_delete_record, \
    db_upsert_inventory_records, get_distinct_years
from db.departments import db_add_responsible_employee

router = APIRouter()

@router.get("")
async def list_records(department_name: str | None = Query(default=None), year: int | None = Query(default=None)):
    filter_ = {}
    if department_name:
        filter_["location_name"] = department_name
    if year is not None:
        filter_["year"] = year
    cursor = fetch_records(filter_)
    records = list(cursor)

    for record in records:
        record["id"] = str(record.pop("_id"))
        record["substance_id"] = str(record["substance_id"])
        record["substance"]["id"] = str(record["substance"].pop("_id"))

    return records

@router.post("")
async def add_record(record: Record = Body(...)):
    inserted_id = insert_record(record.model_dump())
    return {"inserted_id": str(inserted_id)}


@router.post("/inventory")
async def add_records(records: list[Record] = Body(...)):
    if not records:
        return {"status": "ok", "updated": 0}

    return db_upsert_inventory_records(records)


@router.get("/years")
def get_years():
    return get_distinct_years()


@router.post("/inventory/responsible_employee")
async def add_responsible_employee(data: ResponsibleEmployee):
    return db_add_responsible_employee(
        data.employee,
        data.department_name
    )

@router.get("/{record_id}")
async def get_record(record_id: str):
    if not ObjectId.is_valid(record_id):
        raise HTTPException(status_code=400, detail="Neplatné ID záznamu.")
    record = fetch_record(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Záznam nenalezen.")
    record["id"] = str(record.pop("_id"))
    record["substance_id"] = str(record["substance_id"])
    return json.loads(dumps(record))

@router.put("")
async def update_record(substance: Record = Body(...)):
    db_update_record(substance)
    return {"status": "ok"}


@router.delete("/{record_id}")
async def delete_record(record_id: str):
    db_delete_record(record_id)