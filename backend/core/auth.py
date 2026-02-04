from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
import os
import base64, os, hashlib

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "10"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "14"))

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def _create_token(subject: str, expires_delta: timedelta, token_type: str) -> str:
    expire = now_utc() + expires_delta
    to_encode = {"sub": subject, "exp": expire, "type": token_type}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_access_token(subject: str) -> str:
    return _create_token(subject, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES), "access")

def create_refresh_token(subject: str) -> str:
    return _create_token(subject, timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS), "refresh")

def decode_token(token: str, expected_type: str = "access") -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub: Optional[str] = payload.get("sub")
        t: Optional[str] = payload.get("type")
        if not sub or t != expected_type:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")
        return sub
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token.")

def get_current_subject(token: str = Depends(oauth2_scheme)) -> str:
    return decode_token(token, expected_type="access")

def get_refresh_subject_from_cookie(request: Request) -> str:
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Missing refresh token.")
    return decode_token(token, expected_type="refresh")

def now_utc():
    return datetime.utcnow()

def generate_refresh_token() -> str:
    # 48 bytes ~ 64 chars base64url (dostatečné)
    return base64.urlsafe_b64encode(os.urandom(48)).decode("utf-8").rstrip("=")

def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()