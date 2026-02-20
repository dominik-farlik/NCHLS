from enum import StrEnum


class PhysicalForm(StrEnum):
    NONE = ""
    SOLID = "pevná látka"
    GAS = "plyn"
    LIQUID = "kapalina"
    AEROSOL = "aerosol"
    POWDER = "prášek"


class FormAddition(StrEnum):
    IPLP = "IPLP"
    DISINFECTION = "dezinfekce"
    OINTMENT = "mast"
    POWDER = "prášek"
    CLEANSING = "čistící"
    NAPKINS = "ubrousky"
    FREEZE_DRIED = "lyofilizovaný"
    DRUG = "léčivo"
    SOUP = "mýdlo"
    ANALYZE = "analyz."
