from __future__ import annotations
import decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict
from app.schemas.department import DepartmentRead
from app.schemas.substance.substance import SubstanceRead


class DepartmentSubstanceBase(BaseModel):
    department_id: int
    substance_id: int
    year: int
    amount: decimal.Decimal

class DepartmentSubstanceCreate(DepartmentSubstanceBase):
    pass

class DepartmentSubstanceUpdate(BaseModel):
    amount: Optional[decimal.Decimal] = None

class DepartmentSubstanceRead(BaseModel):
    department: DepartmentRead
    substance: SubstanceRead
    year: int
    amount: decimal.Decimal

    model_config = ConfigDict(from_attributes=True)
