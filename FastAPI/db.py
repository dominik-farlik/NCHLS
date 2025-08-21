from bson import ObjectId
from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from pymongo import MongoClient
import os
import logging

from pymongo.errors import DuplicateKeyError

logger = logging.getLogger(__name__)

MONGO_USER = os.getenv("MONGO_USER", "admin")
MONGO_PASSWORD = os.getenv("MONGO_PASSWORD", "secret")
MONGO_HOST = os.getenv("MONGO_HOST", "mongodb")
MONGO_PORT = os.getenv("MONGO_PORT", "27017")

# Create MongoDB client and choose a database
client = MongoClient(f"mongodb://{MONGO_USER}:{MONGO_PASSWORD}@{MONGO_HOST}:{MONGO_PORT}")
db = client.nchls

def insert_substance(data: dict):
    """Insert a substance into the collection and return inserted ID."""
    if db.substances.find_one({"name": data.get("name")}):
        raise HTTPException(
            status_code=400,
            detail = "Látka s názvem {} již existuje.".format(data.get('name'))
        )
    try:
        result = db.substances.insert_one(jsonable_encoder(data))
        return result.inserted_id
    except DuplicateKeyError:
        raise HTTPException(
            status_code=400,
            detail=f"Substance with name '{data.get('name')}' already exists.",
        )


def insert_record(data: dict):
    """Insert a record into the collection and return inserted ID."""
    result = db.records.insert_one(data)
    return result.inserted_id

def add_safety_sheet(substance_id: str):
    """Set a safety sheet in the collection to true."""
    try:
        obj_id = ObjectId(substance_id)
        result = db.substances.update_one(
            {"_id": obj_id},
            {"$set": {"safety_sheet": True}}
        )
        if result.matched_count == 0:
            logger.warning(f"No substance found with id: {substance_id}")
        else:
            logger.info(f"Safety sheet set for substance id: {substance_id}")
    except Exception as e:
        logger.error(f"Failed to update safety sheet for id {substance_id}: {e}")


def fetch_substances():
    """Fetch all substances from the collection."""
    return db.substances.find({})

def fetch_substances_names():
    """Fetch substance names as a list."""
    return [doc["name"] for doc in db.substances.find({}, {"name": 1, "_id": 0})]
