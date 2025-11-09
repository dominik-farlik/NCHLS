from enum import StrEnum


class PhysicalForm(StrEnum):
    NONE = ""
    SOLID = "pevná látka"
    GAS = "plyn"
    LIQUID = "kapalina"
    AEROSOL = "aerosol"
    DUST = "prášek"