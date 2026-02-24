from typing import TypedDict, NotRequired


class PropertyDef(TypedDict):
    name: str
    categories: list[str]
    exposure_routes: NotRequired[list[str]]


PROPERTIES: list[PropertyDef] = [
    {
        "name": "Acute Tox.",
        "categories": ["1", "2", "3", "4"],
        "exposure_routes": ["oral", "dermal", "inhal"],
    },
    {
        "name": "Skin Corr.",
        "categories": ["1A", "1B", "1C"],
        "exposure_routes": [],
    },
    {
        "name": "Skin Irrit.",
        "categories": ["2"],
        "exposure_routes": [],
    },
    {
        "name": "Eye Dam.",
        "categories": ["1"],
        "exposure_routes": [],
    },
    {
        "name": "Eye Irrit.",
        "categories": ["2"],
        "exposure_routes": [],
    },
    {
        "name": "Skin Sens.",
        "categories": ["1", "1A", "1B"],
        "exposure_routes": [],
    },
    {
        "name": "Resp. Sens.",
        "categories": ["1", "1A", "1B"],
        "exposure_routes": [],
    },
    {
        "name": "Muta.",
        "categories": ["1A", "1B", "2"],
        "exposure_routes": [],
    },
    {
        "name": "Carc.",
        "categories": ["1A", "1B", "2"],
        "exposure_routes": [],
    },
    {
        "name": "Repr.",
        "categories": ["1A", "1B", "2"],
        "exposure_routes": [],
    },
    {
        "name": "STOT SE",
        "categories": ["1", "2", "3"],
        "exposure_routes": ["", "CNS"],
    },
    {
        "name": "STOT RE",
        "categories": ["1", "2"],
        "exposure_routes": [],
    },
    {
        "name": "Asp. Tox.",
        "categories": ["1", "2"],
        "exposure_routes": [],
    },
    {
        "name": "Flam. Gas",
        "categories": ["1", "1A", "1B", "2"],
        "exposure_routes": [],
    },
    {
        "name": "chem. Unst. Gas",
        "categories": ["A", "B"],
        "exposure_routes": [],
    },
    {
        "name": "Ox. Gas",
        "categories": ["1"],
        "exposure_routes": [],
    },
    {
        "name": "Ox. Liq.",
        "categories": ["1", "2", "3"],
        "exposure_routes": [],
    },
    {
        "name": "Ox. Sol.",
        "categories": ["1", "2", "3"],
        "exposure_routes": [],
    },
    {
        "name": "Pyroph. Liq.",
        "categories": ["1"],
        "exposure_routes": [],
    },
    {
        "name": "Pyroph. Sol.",
        "categories": ["1"],
        "exposure_routes": [],
    },
    {
        "name": "Aerosol",
        "categories": ["1", "2", "3"],
        "exposure_routes": [],
    },
    {
        "name": "Self-heat.",
        "categories": ["1", "2"],
        "exposure_routes": [],
    },
    {
        "name": "Water-react",
        "categories": ["1", "2", "3"],
        "exposure_routes": [],
    },
    {
        "name": "Flam. Liq.",
        "categories": ["1", "2", "3"],
        "exposure_routes": [],
    },
    {
        "name": "Flam. Sol.",
        "categories": ["1", "2"],
        "exposure_routes": [],
    },
    {
        "name": "Press. Gas.",
        "categories": ["", "komprimovaný", "zkapalněný", "zchlazený", "rozpuštěný"],
        "exposure_routes": [],
    },
    {
        "name": "Met. Corr.",
        "categories": ["1"],
        "exposure_routes": [],
    },
    {
        "name": "Aq. Chronic",
        "categories": ["1", "2", "3", "4"],
        "exposure_routes": [],
    },
    {
        "name": "Aq. Acute",
        "categories": ["1", "2", "3", "4"],
        "exposure_routes": [],
    },
    {
        "name": "EUH",
        "categories": [
            "001",
            "006",
            "014",
            "018",
            "019",
            "029",
            "031",
            "032",
            "044",
            "059",
            "066",
            "070",
            "071",
            "201",
            "201A",
            "202",
            "203",
            "204",
            "205",
            "206",
            "207",
            "208",
            "209",
            "209A",
            "210",
            "401",
        ],
        "exposure_routes": [],
    },
]

PROPERTIES_BY_NAME: dict[str, PropertyDef] = {p["name"]: p for p in PROPERTIES}
