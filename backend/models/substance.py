from pydantic import BaseModel

from constants.h_phrase import HPhrase
from constants.physical_form import PhysicalForm, FormAddition
from constants.protocol_categories import DangerCategory
from constants.substance_mixture import SubstanceMixture
from constants.unit import Unit


class Substance(BaseModel):
    name: str
    substance_mixture: SubstanceMixture = SubstanceMixture.NONE
    physical_form: PhysicalForm = PhysicalForm.NONE
    form_addition: list[FormAddition] | None = None
    properties: list[dict[str, int | str]] | None = None
    h_phrases: list[HPhrase] | None = None
    unit: Unit | None = Unit.NONE
    safety_sheet: str | None = None
    safety_sheet_rev_date: int | str | None = ''
    danger_category: DangerCategory = DangerCategory.NONE