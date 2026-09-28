from pydantic import BaseModel, ConfigDict

from app.schemas.substance.h_statement import HStatementBase
from app.schemas.substance.hazard_category import HazardCategoryBase


class PropertyBase(BaseModel):
    id: int
    name: str
    category_name: str | None = None
    exposure_route_name: str | None = None
    h_statements: list[HStatementBase] | None = None
    hazard_category: list[HazardCategoryBase] | None = None

    model_config = ConfigDict(from_attributes=True)
