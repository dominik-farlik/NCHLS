from pydantic import BaseModel, ConfigDict


class DepartmentBase(BaseModel):
    name: str
    company_id: int
    manager: str | None = None
    code: int | None = None


class DepartmentRead(DepartmentBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class DepartmentUpdate(BaseModel):
    name: str | None = None
    company_id: int | None = None
    manager: str | None = None
    code: int | None = None

    model_config = ConfigDict(from_attributes=True)
