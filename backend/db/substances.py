from bson import ObjectId
from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder

from backend.core.config import settings
from backend.db.connection import db
from backend.models.substance import Substance


def check_duplicate_name(name: str, oid: ObjectId | None = None):
    """Check if a name is duplicate."""
    exists = db.substances.find_one({"name": name, "_id": {"$ne": oid}})
    if exists:
        raise HTTPException(status_code=409, detail="Látka s tímto názvem již existuje.")


def fetch_substances(filter_=None):
    if not filter_:
        return list(db.substances.find({}))

    pipeline = [
        {"$match": filter_},
        {"$group": {"_id": "$substance_id"}},
        {
            "$lookup": {
                "from": "substances",
                "localField": "_id",
                "foreignField": "_id",
                "as": "substance",
            }
        },
        {"$unwind": "$substance"},
        {"$replaceRoot": {"newRoot": "$substance"}},
    ]

    return list(db.records.aggregate(pipeline))


def fetch_substance(substance_id: str):
    """Fetch substance by id from the collection."""
    return db.substances.find_one({"_id": ObjectId(substance_id)})


def fetch_safety_sheet(substance_id: str):
    """Fetch a safety sheet from the collection."""
    substance = db.substances.find_one({"_id": ObjectId(substance_id)})
    if substance is None:
        raise HTTPException(status_code=404, detail="Substance not found.")
    return f"{settings.UPLOAD_DIR}/{substance['safety_sheet']}"


def insert_substance(substance: dict):
    """Insert a substance into the collection and return inserted ID."""
    raw_name = substance.get("name")
    if not isinstance(raw_name, str):
        raise ValueError("Invalid document: missing 'name'")
    check_duplicate_name(raw_name)
    result = db.substances.insert_one(jsonable_encoder(substance))
    return result.inserted_id


def db_update_substance(substance_id: str, substance: Substance):
    oid = ObjectId(substance_id)

    update_doc = jsonable_encoder(substance.model_dump(exclude_none=True))

    if update_doc.get("safety_sheet") in ("", None):
        update_doc.pop("safety_sheet", None)

    check_duplicate_name(update_doc["name"], oid)

    result = db.substances.update_one({"_id": oid}, {"$set": update_doc})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Látka nenalezena.")


def db_delete_substance(substance_id: str):
    """Delete a substance from the collection."""
    db.substances.delete_one({"_id": ObjectId(substance_id)})
