from typing import Annotated

from fastapi import APIRouter, Depends

from app.models import User
from app.routers.auth import get_current_user
from app.schemas.user import UserResponse

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def read_my_profile(current_user: Annotated[User, Depends(get_current_user)]):
    """Vrátí profil aktuálně přihlášeného uživatele"""
    return current_user