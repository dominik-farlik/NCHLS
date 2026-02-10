import uuid
from datetime import timedelta

from bson import ObjectId
from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from pymongo import MongoClient, UpdateOne, InsertOne
import os
import logging

from core.auth import generate_refresh_token, hash_token, now_utc, REFRESH_TOKEN_EXPIRE_DAYS, hash_password, \
    verify_password
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

db.refresh_tokens.create_index("expires_at", expireAfterSeconds=0)
db.refresh_tokens.create_index("token_hash", unique=True)
db.refresh_tokens.create_index("user")
db.users.create_index("username", unique=True)

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
        {"$lookup": {
            "from": "substances",
            "localField": "substance_id",
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


from bson import ObjectId
from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder

def db_update_substance(substance_id: str, substance: Substance):
    oid = ObjectId(substance_id)

    update_doc = jsonable_encoder(substance.model_dump(exclude_none=True))

    if update_doc.get("safety_sheet") in ("", None):
        update_doc.pop("safety_sheet", None)

    check_duplicate_name(update_doc["name"], oid)

    result = db.substances.update_one({"_id": oid}, {"$set": update_doc})
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


def fetch_substance_departments(substance_id: str):
    """Fetch departments, where is substance located."""
    return db.records.aggregate([
        {
            "$match": {
                "substance_id": ObjectId(substance_id)
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


def fetch_amount_sum_substance(substance_id: str):
    """Fetch an amount sum of substance from the collection."""
    return db.records.aggregate([
        {
            "$match": {
                "substance_id": ObjectId(substance_id)
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


def db_delete_record(record_id: str):
    """Delete a record from the collection."""
    result = db.records.delete_one({"_id": ObjectId(record_id)})


def db_upsert_inventory_records(records: list[Record]) -> dict:
    ops = []
    insert_count_expected = 0

    for i, rec in enumerate(records):
        doc = rec.model_dump(exclude_none=True)

        substance_id = doc.get("substance_id")
        if not substance_id:
            raise HTTPException(status_code=400, detail=f"Záznam na indexu {i} nemá substance_id.")
        if not ObjectId.is_valid(substance_id):
            raise HTTPException(status_code=400, detail=f"Záznam na indexu {i} má neplatné substance_id.")
        doc["substance_id"] = ObjectId(substance_id)

        rec_id = doc.pop("id", None)

        if rec_id:
            if not ObjectId.is_valid(rec_id):
                raise HTTPException(status_code=400, detail=f"Záznam na indexu {i} má neplatné id.")

            oid = ObjectId(rec_id)

            ops.append(
                UpdateOne(
                    {"_id": oid},
                    {"$set": doc},
                    upsert=True
                )
            )
        else:
            ops.append(InsertOne(doc))
            insert_count_expected += 1

    if not ops:
        return {"matched": 0, "modified": 0, "upserted": 0, "inserted": 0, "upserted_ids": [], "inserted_ids": []}

    res = db.records.bulk_write(ops, ordered=False)

    upserted_ids = []
    if getattr(res, "upserted_ids", None):
        upserted_ids = [str(oid) for _, oid in sorted(res.upserted_ids.items(), key=lambda x: x[0])]

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

def db_add_responsible_employee(employee: str, department_name: str) -> dict:
    employee = (employee or "").strip()
    department_name = (department_name or "").strip()

    if not department_name:
        raise HTTPException(status_code=400, detail="Název oddělení nesmí být prázdný.")

    res = db.departments.update_one(
        {"name": department_name},
        {"$set": {"responsible_employee": employee}}
    )

    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Oddělení nenalezeno.")

    return {
        "updated": True,
        "modified": res.modified_count == 1,
        "responsible_employee": employee
    }

def fetch_department_by_name(name: str) -> dict:
    doc = db.departments.find_one({"name": name})
    if not doc:
        raise HTTPException(status_code=404, detail="Oddělení nenalezeno.")
    doc["_id"] = str(doc["_id"])
    return doc

def create_refresh_session(user: str, ip: str | None = None, ua: str | None = None):
    refresh_plain = generate_refresh_token()
    token_hash = hash_token(refresh_plain)

    jti = str(uuid.uuid4())
    doc = {
        "user": user,
        "token_hash": token_hash,
        "jti": jti,
        "issued_at": now_utc(),
        "expires_at": now_utc() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        "revoked_at": None,
        "replaced_by_jti": None,
        "last_used_at": None,
        "ip": ip,
        "user_agent": ua,
    }

    db.refresh_tokens.insert_one(doc)
    return refresh_plain, jti

def rotate_refresh_token(refresh_plain: str, ip: str | None = None, ua: str | None = None):
    th = hash_token(refresh_plain)
    doc = db.refresh_tokens.find_one({"token_hash": th})

    if not doc:
        # token neexistuje -> buď expiroval+TTL smazal, nebo je to útok
        raise HTTPException(status_code=401, detail="Invalid refresh token.")

    if doc["revoked_at"] is not None:
        # REUSE DETECTION: někdo použil už jednou otočený token
        # Doporučení: revoke všechno pro user (nebo family_id) a vynutit login
        db.refresh_tokens.update_many(
            {"user": doc["user"], "revoked_at": None},
            {"$set": {"revoked_at": now_utc()}}
        )
        raise HTTPException(status_code=401, detail="Refresh token reuse detected.")

    if doc["expires_at"] <= now_utc():
        raise HTTPException(status_code=401, detail="Refresh token expired.")

    # vytvoř nový
    new_refresh_plain = generate_refresh_token()
    new_hash = hash_token(new_refresh_plain)
    new_jti = str(uuid.uuid4())

    # označ starý jako revoked/rotated
    db.refresh_tokens.update_one(
        {"_id": doc["_id"]},
        {"$set": {
            "revoked_at": now_utc(),
            "replaced_by_jti": new_jti,
            "last_used_at": now_utc(),
        }}
    )

    # ulož nový
    db.refresh_tokens.insert_one({
        "user": doc["user"],
        "token_hash": new_hash,
        "jti": new_jti,
        "issued_at": now_utc(),
        "expires_at": now_utc() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        "revoked_at": None,
        "replaced_by_jti": None,
        "last_used_at": None,
        "ip": ip,
        "user_agent": ua,
    })

    return doc["user"], new_refresh_plain

def get_user_by_username(username: str):
    return db.users.find_one({"username": username})

def create_user(username: str, password: str):
    if db.users.find_one({"username": username}):
        raise HTTPException(status_code=400, detail="User already exists")

    doc = {
        "username": username,
        "password_hash": hash_password(password),
        "is_active": True,
        "created_at": now_utc(),
    }
    db.users.insert_one(doc)
    return doc

def authenticate_user(username: str, password: str):
    user = db.users.find_one({"username": username})
    if not user or not user.get("is_active", True):
        return None
    if not verify_password(password, user["password_hash"]):
        return None
    return user