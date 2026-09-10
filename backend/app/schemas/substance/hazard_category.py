import decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class HazardCategoryBase(BaseModel):
    name: str
    section: Optional[str] = None
    max_amount_a: Optional[decimal.Decimal] = None
    code: Optional[str] = None
    max_amount_b: Optional[decimal.Decimal] = None
    protocol_table_name: Optional[str] = None
    note: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)