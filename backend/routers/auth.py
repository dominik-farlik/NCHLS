from fastapi import APIRouter, HTTPException, Response, Request
from pydantic import BaseModel

from core.auth import create_access_token, REFRESH_TOKEN_EXPIRE_DAYS, hash_token, now_utc
from db.repo import create_refresh_session, rotate_refresh_token, db, authenticate_user

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(body: LoginRequest, request: Request, response: Response):
    user = authenticate_user(body.username, body.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access = create_access_token(subject=user["username"])

    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")

    refresh_plain, _jti = create_refresh_session(user["username"], ip=ip, ua=ua)

    response.set_cookie(
        key="refresh_token",
        value=refresh_plain,
        httponly=True,
        secure=False,  # True na HTTPS
        samesite="lax",
        path="/api/auth/refresh",
        max_age=60 * 60 * 24 * REFRESH_TOKEN_EXPIRE_DAYS,
    )

    return {"access_token": access, "token_type": "bearer"}

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
        secure=False,
        samesite="lax",
        path="/api/auth/refresh",
        max_age=60*60*24*REFRESH_TOKEN_EXPIRE_DAYS,
    )
    return {"access_token": access, "token_type": "bearer"}


@router.post("/logout")
def logout(request: Request, response: Response):
    refresh_plain = request.cookies.get("refresh_token")
    if refresh_plain:
        db.refresh_tokens.update_one(
            {"token_hash": hash_token(refresh_plain), "revoked_at": None},
            {"$set": {"revoked_at": now_utc()}}
        )
    response.delete_cookie("refresh_token", path="/api/auth/refresh")
    return {"ok": True}

