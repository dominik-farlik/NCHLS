from fastapi.encoders import jsonable_encoder
from pymongo import MongoClient
import os

MONGO_USER = os.getenv("MONGO_USER", "admin")
MONGO_PASSWORD = os.getenv("MONGO_PASSWORD", "secret")
MONGO_HOST = os.getenv("MONGO_HOST", "mongodb")
MONGO_PORT = os.getenv("MONGO_PORT", "27017")

# Create MongoDB client and choose a database
client = MongoClient(f"mongodb://{MONGO_USER}:{MONGO_PASSWORD}@{MONGO_HOST}:{MONGO_PORT}")
db = client.nchls

def insert_substance(data: dict):
    """Insert a substance into the collection and return inserted ID."""
    result = db.substances.insert_one(jsonable_encoder(data))
    return result.inserted_id


def insert_record(data: dict):
    """Insert a record into the collection and return inserted ID."""
    result = db.records.insert_one(data)
    return result.inserted_id
