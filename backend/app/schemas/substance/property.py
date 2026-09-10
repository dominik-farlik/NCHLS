from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.schemas.substance.h_statement import HStatementBase
from app.schemas.substance.hazard_category import HazardCategoryBase


class PropertyBase(BaseModel):
    name: str
    category_name: Optional[str] = None
    exposure_route_name: Optional[str] = None
    h_statement: Optional[list[HStatementBase]] = None
    hazard_category: Optional[list[HazardCategoryBase]] = None

    model_config = ConfigDict(from_attributes=True)