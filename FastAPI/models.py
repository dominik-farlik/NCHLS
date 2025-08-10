from enum import Enum, StrEnum
from pydantic import BaseModel


class Unit(Enum):
    KG = "kg"
    G = "g"
    L = "l"
    ML = "ml"
    KS = "ks"


class PhysicalForm(StrEnum):
    SOLID = "solid"
    LIQUID = "liquid"
    GAS = "gas"


class Substance(BaseModel):
    name: str
    physical_form: str
    #acute_toxicity: int auto add by properties
    properties: list[dict[str, str]]
    unit: Unit


class Record(BaseModel):
    substance: Substance
    amount: int
    location_name: str
    year: int

