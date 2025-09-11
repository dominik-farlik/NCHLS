from typing import Optional
from pydantic import BaseModel
from substance_properties import Unit, PhysicalForm
from bson import ObjectId

class Substance(BaseModel):
    name: str
    physical_form: PhysicalForm
    properties: list[dict[str, str]]
    unit: Unit
    substance_mixture: str

class Record(BaseModel):
    substance_id: str
    amount: int
    location_name: str
    year: int
