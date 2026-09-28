import decimal

from pydantic import BaseModel, ConfigDict


class HazardCategoryBase(BaseModel):
    id: int
    name: str
    section: str | None = None
    max_amount_a: decimal.Decimal | None = None
    code: str | None = None
    max_amount_b: decimal.Decimal | None = None
    protocol_table_name: str | None = None
    note: str | None = None

    model_config = ConfigDict(from_attributes=True)
