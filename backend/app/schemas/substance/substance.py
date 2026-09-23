import decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.schemas.department import DepartmentRead
from app.schemas.substance.hazard_category import HazardCategoryBase
from app.schemas.substance.property import PropertyBase


class SubstanceBase(BaseModel):
    name: str
    mixture: bool = True
    physical_form_name: Optional[str] = None
    unit_name: Optional[str] = None
    sds_revision_year: Optional[int] = None
    note: Optional[str] = None
    water_toxicity_ec50: Optional[str] = None
    manufacturer: Optional[str] = None
    code: Optional[str] = None
    company_id: Optional[int] = None
    sds: Optional[str] = None
    hazard_category: list[HazardCategoryBase] = []

class SubstanceCreate(SubstanceBase):
    property_ids: list[int] = []

class SubstanceUpdate(SubstanceBase):
    property_ids: list[int] = []

class SubstanceRead(SubstanceBase):
    id: int
    properties: Optional[list[PropertyBase]] = None
    departments: list[SubstanceDepartments] = []

    model_config = ConfigDict(from_attributes=True)


class SubstancePaginationRead(BaseModel):
    items: list[SubstanceRead]
    total: int
    limit: int
    offset: int


class SubstanceDepartments(BaseModel):
    department: DepartmentRead
    year: int
    amount: decimal.Decimal

    model_config = ConfigDict(from_attributes=True)