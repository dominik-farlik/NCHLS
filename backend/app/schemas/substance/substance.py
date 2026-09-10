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
    properties: Optional[list[PropertyBase]] = None
    sds_revision_year: Optional[int] = None
    note: Optional[str] = None
    water_toxicity_ec50: Optional[str] = None
    manufacturer: Optional[str] = None
    code: Optional[str] = None
    company_id: Optional[int] = None
    sds: Optional[str] = None
    departments: list[SubstanceDepartments] = []
    hazard_category: list[HazardCategoryBase] = []

class SubstanceCreate(SubstanceBase):
    pass

class SubstanceUpdate(BaseModel):
    name: Optional[str] = None
    mixture: Optional[bool] = None
    physical_form_name: Optional[str] = None
    unit_name: Optional[str] = None
    sds_revision_year: Optional[int] = None
    note: Optional[str] = None
    water_toxicity_ec50: Optional[str] = None
    manufacturer: Optional[str] = None
    code: Optional[str] = None
    company_id: Optional[int] = None
    sds: Optional[str] = None

class SubstanceRead(SubstanceBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class SubstanceDepartments(BaseModel):
    department: DepartmentRead
    year: int
    amount: decimal.Decimal

    model_config = ConfigDict(from_attributes=True)