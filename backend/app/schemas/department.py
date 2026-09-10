from typing import Optional

from pydantic import BaseModel, ConfigDict


class DepartmentBase(BaseModel):
    name: str
    company_id: int
    manager: Optional[str] = None
    code: Optional[int] = None


class DepartmentRead(DepartmentBase):
    id: int

    model_config = ConfigDict(from_attributes=True)