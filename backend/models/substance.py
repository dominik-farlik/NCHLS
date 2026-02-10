from pydantic import BaseModel, Field

from constants.physical_form import PhysicalForm, FormAddition
from constants.substance_mixture import SubstanceMixture
from constants.unit import Unit


class Substance(BaseModel):
    substance_id: str | None = None
    name: str
    physical_form: PhysicalForm = PhysicalForm.NONE
    form_addition: list[FormAddition] | None = None
    properties: list[dict[str, int | str]] | None = None
    unit: Unit | None = Unit.NONE
    substance_mixture: SubstanceMixture = SubstanceMixture.NONE
    safety_sheet: str | None = None
    safety_sheet_rev_date: int | str | None = ''