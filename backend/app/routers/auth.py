from fastapi import APIRouter, Response, Request
from pydantic import BaseModel

router = APIRouter()


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(body: LoginRequest, request: Request, response: Response):
    return {"access_token": "access_token", "token_type": "bearer"}


@router.post("/logout")
def logout(request: Request, response: Response):
    return {"ok": True}
