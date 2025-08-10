from dataclasses import dataclass
from enum import Enum, StrEnum, IntEnum, auto


# ACUTE TOXICITY

class ExposureRoute(StrEnum):
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

ACUTE_TOXICITY: AcuteToxicity

# SKIN

class SkinCorrosion(Enum):
    CATEGORY_1A = "1A"
    CATEGORY_1B = "1B"
    CATEGORY_1C = "1C"

class SkinIrritation(Enum):
    CATEGORY_2 = "2"

# EYES

class EyeDamage(IntEnum):
    CATEGORY_1 = 1

class EyeIrritation(IntEnum):
    CATEGORY_2 = 2

# DANGER CATEGORY