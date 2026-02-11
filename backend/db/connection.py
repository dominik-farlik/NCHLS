import os
import logging
from pymongo import MongoClient

logger = logging.getLogger(__name__)

MONGO_USER = os.getenv("MONGO_USER", "admin")
MONGO_PASSWORD = os.getenv("MONGO_PASSWORD", "secret")
MONGO_HOST = os.getenv("MONGO_HOST", "mongodb")
MONGO_PORT = os.getenv("MONGO_PORT", "27017")

client = MongoClient(
    f"mongodb://{MONGO_USER}:{MONGO_PASSWORD}@{MONGO_HOST}:{MONGO_PORT}/?authSource=admin",
    serverSelectionTimeoutMS=3000,
)

db = client.nchls

def init_indexes() -> None:
    db.records.create_index([("location_name", 1), ("year", 1)])
    db.records.create_index("substance_id")
    db.refresh_tokens.create_index("expires_at", expireAfterSeconds=0)
    db.refresh_tokens.create_index("token_hash", unique=True)
    db.refresh_tokens.create_index("user")
    db.users.create_index("username", unique=True)
    logger.info("Mongo indexes ensured.")