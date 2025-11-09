from fastapi import APIRouter, Body, HTTPException
from bson import ObjectId
from bson.json_util import dumps
import json

from models.substance import Substance
from db.repo import insert_substance, fetch_substances, fetch_substance, db_update_substance

router = APIRouter()

@router.get("")
async def list_substances():
    cursor = fetch_substances()
    return json.loads(dumps(cursor))

@router.get("/{substance_id}")
async def get_substance(substance_id: str):
    if not ObjectId.is_valid(substance_id):
        raise HTTPException(status_code=400, detail="Neplatné ID látky.")
    doc = fetch_substance(substance_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Látka nenalezena.")
    doc["id"] = str(doc.pop("_id"))
    return doc

@router.post("")
async def add_substance(substance: Substance = Body(...)):
    inserted_id = insert_substance(substance.model_dump())
    return {"id": str(inserted_id)}

@router.put("")
async def update_substance(substance: Substance = Body(...)):
    db_update_substance(substance)
    return {"status": "ok"}
