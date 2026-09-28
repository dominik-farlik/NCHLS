from pydantic import BaseModel, ConfigDict

from app.schemas.role import RoleResponse


class UserBase(BaseModel):
    first_name: str
    last_name: str

    model_config = ConfigDict(from_attributes=True)


class PasswordResetRequest(BaseModel):
    email: str


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str


class UserResponse(UserBase):
    id: int
    email: str
    username: str | None
    role: RoleResponse


class UserCreate(UserBase):
    email: str
    password: str
    username: str | None = None


class UserUpdate(UserBase):
    email: str
    username: str | None = None


class ManagerResponse(UserBase):
    id: int
