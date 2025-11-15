from bson import ObjectId
from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from pymongo import MongoClient
import os
import logging

from core.config import settings
from models.record import Record
from models.substance import Substance

logger = logging.getLogger(__name__)

MONGO_USER = os.getenv("MONGO_USER", "admin")
MONGO_PASSWORD = os.getenv("MONGO_PASSWORD", "secret")
MONGO_HOST = os.getenv("MONGO_HOST", "mongodb")
MONGO_PORT = os.getenv("MONGO_PORT", "27017")

client = MongoClient(f"mongodb://{MONGO_USER}:{MONGO_PASSWORD}@{MONGO_HOST}:{MONGO_PORT}")
db = client.nchls


def insert_substance(substance: dict):
    """Insert a substance into the collection and return inserted ID."""
    check_duplicate_name(substance.get("name"))

    result = db.substances.insert_one(jsonable_encoder(substance))
    return result.inserted_id


def insert_record(record: dict):
    """Insert a record into the collection and return inserted ID."""
    record["substance_id"] = ObjectId(record["substance_id"])
    result = db.records.insert_one(record)
    return result.inserted_id


def fetch_substances():
    """Fetch all substances from the collection."""
    return db.substances.find({})


def fetch_substance(substance_id: str):
    """Fetch substance by id from the collection."""
    return db.substances.find_one({"_id": ObjectId(substance_id)})


def fetch_records(filter_=None):
    """Fetch all records from the collection."""
    if filter_ is None:
        filter_ = {}
    return db.records.aggregate([
        {"$match": filter_},
        {"$addFields": {
            "substance_oid": {
                "$cond": [
                    {"$eq": [{"$type": "$substance_id"}, "objectId"]},
                    "$substance_id",
                    {"$toObjectId": "$substance_id"}
                ]
            }
        }},
        {"$lookup": {
            "from": "substances",
            "localField": "substance_oid",
            "foreignField": "_id",
            "as": "substance"
        }},
        {"$unwind": {"path": "$substance", "preserveNullAndEmptyArrays": True}},
    ])


def fetch_record(record_id: str):
    """Fetch record by id from the collection."""
    return db.records.find_one({"_id": ObjectId(record_id)})


def fetch_departments():
    """Fetch all departments from the collection."""
    return db.departments.find({})


def check_duplicate_name(name: str, oid: ObjectId = None):
    """Check if a name is duplicate."""
    exists = db.substances.find_one({"name": name, "_id": {"$ne": oid}})
    if exists:
        raise HTTPException(status_code=409, detail=f"Látka s tímto názvem již existuje.")


def db_update_substance(substance: Substance):
    update_doc = substance.model_dump(exclude_none=True)
    oid = ObjectId(update_doc["id"])

    if not update_doc:
        raise HTTPException(status_code=400, detail="Nebyly poskytnuty žádné změny.")
    update_doc.pop("id", None)

    check_duplicate_name(update_doc["name"], oid)

    result = db.substances.update_one({"_id": oid}, {"$set": jsonable_encoder(update_doc)})

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Látka nenalezena.")

    updated = db.substances.find_one({"_id": oid})
    updated["id"] = str(updated.pop("_id"))
    return {"updated": True, "substance": updated}


def db_update_record(record: Record):
    update_doc = record.model_dump(exclude_none=True)
    oid = ObjectId(update_doc["id"])
    update_doc["substance_id"] = ObjectId(update_doc["substance_id"])
    if not update_doc:
        raise HTTPException(status_code=400, detail="Nebyly poskytnuty žádné změny.")
    update_doc.pop("id", None)

    result = db.records.update_one({"_id": oid}, {"$set": update_doc})

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Záznam nenalezen.")


def fetch_safety_sheet(substance_id: str):
    """Fetch a safety sheet from the collection."""
    substance = db.substances.find_one({"_id": ObjectId(substance_id)})
    return f"{settings.UPLOAD_DIR}/{substance['safety_sheet']}"


def fetch_substance_departments(substance_id: ObjectId):
    """Fetch departments, where is substance located."""
    return db.records.aggregate([
        {
            "$match": {
                "substance_id": substance_id
            }
        },
        {
            "$group": {
                "_id": "$substance_id",
                "departments": {
                    "$addToSet": "$location_name"
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                "substance_id": "$_id",
                "departments": 1
            }
        }
    ])


def fetch_amount_sum_substance(substance_id: ObjectId):
    """Fetch an amount sum of substance from the collection."""
    return db.records.aggregate([
        {
            "$match": {
                "substance_id": substance_id
            }
        },
        {
            "$group": {
                "_id": "$substance_id",
                "total_amount": {"$sum": "$amount"}
            }
        },
        {
            "$lookup": {
                "from": "substances",
                "localField": "_id",
                "foreignField": "_id",
                "as": "substance"
            }
        },
        {"$unwind": "$substance"},
        {
            "$project": {
                "_id": 0,
                "substance_id": "$_id",
                "total_amount": 1,
                "unit": "$substance.unit"
            }
        }
    ])


def db_delete_substance(substance_id: str):
    """Delete a substance from the collection."""
    result = db.substances.delete_one({"_id": ObjectId(substance_id)})