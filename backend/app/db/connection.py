import os
import logging
from pymongo import MongoClient
from pymongo.database import Database

logger = logging.getLogger(__name__)

def build_mongo_dsn() -> str:
    user = os.getenv("MONGO_USER", "admin")
    pwd = os.getenv("MONGO_PASSWORD", "secret")
    host = os.getenv("MONGO_HOST", "mongodb")
    port = os.getenv("MONGO_PORT", "27017")
    auth_source = os.getenv("MONGO_AUTH_SOURCE", "admin")
    return f"mongodb://{user}:{pwd}@{host}:{port}/?authSource={auth_source}"

def create_client() -> MongoClient:
    return MongoClient(build_mongo_dsn(), serverSelectionTimeoutMS=3000)

def get_db(app):
    db_name = os.getenv("MONGO_DB_NAME", "nchls")
    return app.state.mongo_client[db_name]

def init_indexes(db: Database) -> None:
    db.records.create_index([("location_name", 1), ("year", 1)])
    db.records.create_index("substance_id")
    db.refresh_tokens.create_index("expires_at", expireAfterSeconds=0)
    db.refresh_tokens.create_index("token_hash", unique=True)
    db.refresh_tokens.create_index("user")
    db.users.create_index("username", unique=True)
    logger.info("Mongo indexes ensured.")