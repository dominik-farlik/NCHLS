import uuid
from datetime import timedelta
from fastapi import HTTPException

from backend.core.auth import (
    generate_refresh_token,
    hash_token,
    now_utc,
    REFRESH_TOKEN_EXPIRE_DAYS,
    hash_password,
    verify_password,
)
from backend.db.connection import db


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
        raise HTTPException(status_code=401, detail="Invalid refresh token.")

    if doc["revoked_at"] is not None:
        db.refresh_tokens.update_many(
            {"user": doc["user"], "revoked_at": None}, {"$set": {"revoked_at": now_utc()}}
        )
        raise HTTPException(status_code=401, detail="Refresh token reuse detected.")

    if doc["expires_at"] <= now_utc():
        raise HTTPException(status_code=401, detail="Refresh token expired.")

    new_refresh_plain = generate_refresh_token()
    new_hash = hash_token(new_refresh_plain)
    new_jti = str(uuid.uuid4())

    db.refresh_tokens.update_one(
        {"_id": doc["_id"]},
        {
            "$set": {
                "revoked_at": now_utc(),
                "replaced_by_jti": new_jti,
                "last_used_at": now_utc(),
            }
        },
    )

    db.refresh_tokens.insert_one(
        {
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
        }
    )

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
