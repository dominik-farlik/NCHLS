from typing import Optional
from pydantic import BaseModel

from constants.physical_form import PhysicalForm
from constants.substance_mixture import SubstanceMixture
from constants.unit import Unit


class Substance(BaseModel):
    substance_id: Optional[str] = None
    name: str
    physical_form: PhysicalForm = PhysicalForm.NONE
    properties: Optional[list[dict[str, str]]]
    unit: Unit | None = Unit.NONE
    substance_mixture: SubstanceMixture = SubstanceMixture.NONE
    iplp: Optional[bool] = False
    disinfection: Optional[bool] = False
    safety_sheet: Optional[str] = None
    safety_sheet_rev_date: Optional[int | str] = ''