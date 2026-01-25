from enum import StrEnum

class Unit(StrEnum):
    NONE = ""
    GRAM = "g"
    KILOGRAM = "kg"
    MILLILITER = "ml"
    LITER = "l"
    PIECE = "ks"
    PIPE = "rozvod v trubkách"

UNIT_TO_TON_FACTOR = {
    "kg": 1 / 1000,
    "l": 1 / 1000,
    "ml": 1 / 1_000_000,
    "g": 1 / 1_000_000,
}

def to_tons(amount: float, unit: str | None) -> float | None:
    if unit not in UNIT_TO_TON_FACTOR:
        return 0
    return amount * UNIT_TO_TON_FACTOR[unit]