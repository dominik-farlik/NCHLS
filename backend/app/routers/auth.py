from fastapi import APIRouter, HTTPException, Response, Request
from pydantic import BaseModel

from app.core.auth import create_access_token, REFRESH_TOKEN_EXPIRE_DAYS, hash_token, now_utc

router = APIRouter()


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(body: LoginRequest, request: Request, response: Response):
    return {"access_token": "access_token", "token_type": "bearer"}


@router.post("/refresh")
def refresh(request: Request, response: Response):
    refresh_plain = request.cookies.get("refresh_token")
    if not refresh_plain:
        raise HTTPException(status_code=401, detail="Missing refresh token.")

    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")

    user, new_refresh_plain = rotate_refresh_token(refresh_plain, ip=ip, ua=ua)
    access = create_access_token(subject=user)

    response.set_cookie(
        key="refresh_token",
        value=new_refresh_plain,
        httponly=True,
        secure=True,
        samesite="lax",
        path="/api/auth/refresh",
        max_age=60 * 60 * 24 * REFRESH_TOKEN_EXPIRE_DAYS,
    )
    return {"access_token": access, "token_type": "bearer"}


@router.post("/logout")
def logout(request: Request, response: Response):
    return {"ok": True}
