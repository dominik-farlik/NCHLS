import decimal

from pydantic import BaseModel, ConfigDict

from app.schemas.department import DepartmentRead
from app.schemas.substance.hazard_category import HazardCategoryBase
from app.schemas.substance.property import PropertyBase


class SubstanceBase(BaseModel):
    name: str
    mixture: bool = True
    physical_form_name: str | None = None
    unit_name: str | None = None
    sds_revision_year: int | None = None
    note: str | None = None
    water_toxicity_ec50: str | None = None
    manufacturer: str | None = None
    code: str | None = None
    company_id: int | None = None
    sds: str | None = None


class SubstanceCreate(SubstanceBase):
    property_ids: list[int] = []
    hazard_category_ids: list[int] = []


class SubstanceUpdate(SubstanceBase):
    property_ids: list[int] = []
    hazard_category_ids: list[int] = []


class SubstanceDepartments(BaseModel):
    department: DepartmentRead
    year: int
    amount: decimal.Decimal

    model_config = ConfigDict(from_attributes=True)


class SubstanceRead(SubstanceBase):
    id: int
    properties: list[PropertyBase] | None = None
    departments: list[SubstanceDepartments] = []
    hazard_category: list[HazardCategoryBase] = []

    model_config = ConfigDict(from_attributes=True)


class SubstancePaginationRead(BaseModel):
    items: list[SubstanceRead]
    total: int
    limit: int
    offset: int
