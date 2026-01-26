from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os

from core.auth import create_access_token

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(body: LoginRequest):
    admin_user = os.getenv("APP_ADMIN_USER", "admin")
    admin_pass = os.getenv("APP_ADMIN_PASSWORD", "secret")

    if body.username != admin_user or body.password != admin_pass:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(subject=body.username)
    return {"access_token": token, "token_type": "bearer"}
