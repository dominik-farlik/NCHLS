from dataclasses import dataclass
from enum import Enum, IntEnum

class Unit(Enum):
    G = "g"
    KG = "kg"
    ML = "ml"
    L = "l"
    KS = "ks"
    NONE = ""


class PhysicalForm(Enum):
    SOLID = "Pevná"
    LIQUID = "Kapalná"
    GAS = "Plynná"
    NONE = ""


# ACUTE TOXICITY
class ExposureRoute(Enum):
    ORAL = "oral"
    DERMAL = "dermal"
    INHALATION = "inhalation"

class ToxicityLevel(IntEnum):
    LEVEL_1 = 1
    LEVEL_2 = 2
    LEVEL_3 = 3
    LEVEL_4 = 4

@dataclass
class AcuteToxicity:
    level: ToxicityLevel
    route: ExposureRoute

class SkinCorrosion(Enum):
    CATEGORY_1A = "1A"
    CATEGORY_1B = "1B"
    CATEGORY_1C = "1C"

class SkinIrritation(Enum):
    CATEGORY_2 = "2"

class EyeDamage(IntEnum):
    CATEGORY_1 = 1

class EyeIrritation(IntEnum):
    CATEGORY_2 = 2

