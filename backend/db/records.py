from bson import ObjectId
from fastapi import HTTPException
from pymongo import InsertOne, UpdateOne

from backend.db.connection import db
from backend.models.record import Record


def fetch_records(filter_=None):
    """Fetch all records from the collection."""
    if filter_ is None:
        filter_ = {}
    return db.records.aggregate(
        [
            {"$match": filter_},
            {
                "$lookup": {
                    "from": "substances",
                    "localField": "substance_id",
                    "foreignField": "_id",
                    "as": "substance",
                }
            },
            {"$unwind": {"path": "$substance", "preserveNullAndEmptyArrays": True}},
        ]
    )


def fetch_record(record_id: str):
    """Fetch record by id from the collection."""
    return db.records.find_one({"_id": ObjectId(record_id)})


def insert_record(record: dict):
    """Insert a record into the collection and return inserted ID."""
    record["substance_id"] = ObjectId(record["substance_id"])
    result = db.records.insert_one(record)
    return result.inserted_id


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


def db_delete_record(record_id: str):
    """Delete a record from the collection."""
    db.records.delete_one({"_id": ObjectId(record_id)})


def fetch_substance_departments(substance_id: str):
    """Fetch departments, where is substance located."""
    return db.records.aggregate(
        [
            {"$match": {"substance_id": ObjectId(substance_id)}},
            {"$group": {"_id": "$substance_id", "departments": {"$addToSet": "$location_name"}}},
            {"$project": {"_id": 0, "substance_id": "$_id", "departments": 1}},
        ]
    )


def db_upsert_inventory_records(records: list[Record]) -> dict:
    ops: list[InsertOne | UpdateOne] = []
    insert_count_expected = 0

    for i, rec in enumerate(records):
        doc = rec.model_dump(exclude_none=True)

        substance_id = doc.get("substance_id")
        if not substance_id:
            raise HTTPException(status_code=400, detail=f"Záznam na indexu {i} nemá substance_id.")
        if not ObjectId.is_valid(substance_id):
            raise HTTPException(
                status_code=400, detail=f"Záznam na indexu {i} má neplatné substance_id."
            )
        doc["substance_id"] = ObjectId(substance_id)

        rec_id = doc.pop("id", None)

        if rec_id:
            if not ObjectId.is_valid(rec_id):
                raise HTTPException(status_code=400, detail=f"Záznam na indexu {i} má neplatné id.")

            oid = ObjectId(rec_id)

            ops.append(UpdateOne({"_id": oid}, {"$set": doc}, upsert=True))
        else:
            ops.append(InsertOne(doc))
            insert_count_expected += 1

    if not ops:
        return {
            "matched": 0,
            "modified": 0,
            "upserted": 0,
            "inserted": 0,
            "upserted_ids": [],
            "inserted_ids": [],
        }

    res = db.records.bulk_write(ops, ordered=False)

    upserted_ids: list[str] = []

    upserted = getattr(res, "upserted_ids", None)
    if upserted is not None:
        upserted_ids = [str(oid) for _, oid in sorted(upserted.items())]

    inserted_ids = []
    if hasattr(res, "inserted_ids") and res.inserted_ids:
        inserted_ids = [str(x) for x in res.inserted_ids]

    return {
        "matched": res.matched_count,
        "modified": res.modified_count,
        "upserted": res.upserted_count,
        "inserted": len(inserted_ids) if inserted_ids else insert_count_expected,
        "upserted_ids": upserted_ids,
        "inserted_ids": inserted_ids,
    }


def fetch_amount_sum_substance(substance_id: str):
    """Fetch an amount sum of substance from the collection."""
    return db.records.aggregate(
        [
            {"$match": {"substance_id": ObjectId(substance_id)}},
            {"$group": {"_id": "$substance_id", "total_amount": {"$sum": "$amount"}}},
            {
                "$lookup": {
                    "from": "substances",
                    "localField": "_id",
                    "foreignField": "_id",
                    "as": "substance",
                }
            },
            {"$unwind": "$substance"},
            {
                "$project": {
                    "_id": 0,
                    "substance_id": "$_id",
                    "total_amount": 1,
                    "unit": "$substance.unit",
                }
            },
        ]
    )


def get_distinct_years():
    years = db.records.distinct("year")
    return sorted([y for y in years if y is not None], reverse=True)
