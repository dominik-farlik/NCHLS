from enum import StrEnum

from pydantic import BaseModel, ConfigDict


class RoleEnum(StrEnum):
    VIEWER = "viewer"
    EDITOR = "editor"
    MANAGER = "manager"


class RoleResponse(BaseModel):
    name: str

    model_config = ConfigDict(from_attributes=True)


class RoleUpdate(BaseModel):
    name: RoleEnum
