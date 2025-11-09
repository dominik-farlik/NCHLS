from typing import Optional
from pydantic import BaseModel, ConfigDict
from property_dicts import Unit, PhysicalForm

class Substance(BaseModel):
    id: Optional[str] = None
    name: str
    physical_form: Optional[PhysicalForm] = None
    properties: Optional[list[dict[str, str]]]
    unit: Optional[Unit] = Unit.PIECE
    substance_mixture: Optional[str] = None
    iplp: Optional[bool] = False
    disinfection: Optional[bool]
    safety_sheet: Optional[str] = None

class Record(BaseModel):
    substance_id: str
    amount: int
    location_name: str
    year: int

class PropertyItem(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    exposure_route: Optional[str] = None
