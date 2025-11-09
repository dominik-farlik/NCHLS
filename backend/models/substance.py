from typing import Optional
from pydantic import BaseModel

from constants.physical_form import PhysicalForm
from constants.unit import Unit


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