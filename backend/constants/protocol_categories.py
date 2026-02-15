from dataclasses import dataclass
from enum import StrEnum

from constants.physical_form import PhysicalForm


class DangerCategory(StrEnum):
    NONE = ""

    H1 = "H1 (0.1)"
    H2 = "H2 (1)"
    H3 = "H3 (1)"

    P1a = "P1a (0.2)"
    P1b = "P1b (1)"
    P2 = "P2 (0.2)"
    P3a = "P3a (3)"
    P3b = "P3b (100)"
    P4 = "P4 (1)"
    P5a = "P5a (0.2)"
    P5b = "P5b (1)"
    P5c = "P5c (100)"
    P6a = "P6a (0.2)"
    P6b = "P6b (1)"
    P7 = "P7 (1)"
    P8 = "P8 (1)"

    E1 = "E1 (2)"
    E2 = "E2 (4)"

    O1 = "O1 (2)"
    O2 = "O2 (2)"
    O3 = "O3 (1)"

    II1 = "II.1. (100)"
    II2 = "II.2. (25)"
    II3 = "II.3. (7)"
    II4 = "II.4. (0.2)"
    II5 = "II.5. (100)"
    II6 = "II.6. (25)"
    II7 = "II.7. (0.02)"
    II8 = "II.8. ()"
    II9 = "II.9. (0.4)"
    II10 = "II.10. (0.2)"
    II11 = "II.11. ()"
    II12 = "II.12. (0.2)"
    II13 = "II.13. (0.2)"
    II14 = "II.14. (0.1)"
    II15 = "II.15. (0.1)"
    II16 = "II.16. (0.5)"
    II17 = "II.17. (0.1)"
    II18 = "II.18. (1)"
    II19 = "II.19. (0.1)"
    II20 = "II.20. (0.1)"
    II21 = "II.21. (0.1)"
    II22 = "II.22. (10)"
    II23 = "II.23. ()"
    II24 = "II.24. ()"
    II25 = "II.25. (4)"
    II26 = "II.26. (0.2)"
    II27 = "II.27. (0.006)"
    II28 = "II.28. (0.004)"
    II29 = "II.29. (0.004)"
    II30 = "II.30. ()"
    II31 = "II.31. (0.3)"
    II32 = "II.32. ()"
    II33 = "II.33. (0.01)"
    II34 = "II.34. (50)"
    II35 = "II.35. (1)"
    II36 = "II.36. (0.1)"
    II37 = "II.37. (0.1)"
    II38 = "II.38. (1)"
    II39 = "II.39. (1)"
    II40 = "II.40. (1)"
    II41 = "II.41. (4)"
    II42 = "II.42. (10)"
    II43 = "II.43. (4)"
    II44 = "II.44. (10)"
    II45 = "II.45. (2)"
    II46 = "II.46. (10)"
    II47 = "II.47. (10)"
    II48 = "II.48. (10)"


class Group(StrEnum):
    H = "H"
    P = "P"
    E = "E"
    O = "O"
    II = "II"


class Table(StrEnum):
    I = "I"
    II = "II"


@dataclass(frozen=True)
class DangerMeta:
    group: Group
    threshold: float | None
    form: PhysicalForm | None
    properties: tuple[str, ...] = ()

    @property
    def table(self) -> Table:
        return Table.II if self.group == Group.II else Table.I


def meta(group: Group, threshold: float | None, props: tuple[str, ...] = (), form: PhysicalForm | None = None) -> DangerMeta:
    return DangerMeta(group=group, threshold=threshold, properties=props, form=form)


DANGER_META: dict[DangerCategory, DangerMeta] = {

    # H
    DangerCategory.H1: meta(Group.H, 0.1, ("Acute Tox. 1",)),
    DangerCategory.H2: meta(Group.H, 1, ("Acute Tox. 2", "Acute Tox. 3 (inhal)")),
    DangerCategory.H3: meta(Group.H, 1, ("STOT SE 1",)),

    # P
    DangerCategory.P1a: meta(Group.P, 0.2, ("Unst. Expl.", "Expl. 1.1", "Expl. 1.2", "Expl. 1.3", "Expl. 1.5", "Expl. 1.6")),
    DangerCategory.P1b: meta(Group.P, 1, ("Expl. 1.4",)),
    DangerCategory.P2: meta(Group.P, 0.2, ("Flam. Gas 1", "Flam. Gas 2")),
    DangerCategory.P3a: meta(Group.P, 3, ("Aerosol 1", "Aerosol 2")),
    DangerCategory.P3b: meta(Group.P, 100, ("Aerosol 1", "Aerosol 2")),
    DangerCategory.P4: meta(Group.P, 1, ("Ox. Gas 1",)),
    DangerCategory.P5a: meta(Group.P, 0.2, ("Flam. Liq. 1", "Flam. Liq. 2", "Flam. Liq. 3")),
    DangerCategory.P5b: meta(Group.P, 1, ("Flam. Liq. 2", "Flam. Liq. 3")),
    DangerCategory.P5c: meta(Group.P, 100, ("Flam. Liq. 2", "Flam. Liq. 3")),
    DangerCategory.P6a: meta(Group.P, 0.2, ("Self-react. A", "Self-react. B", "Org. Perox. A", "Org. Perox. B")),
    DangerCategory.P6b: meta(Group.P, 1, ("Self-react.", "Org. Perox.")),
    DangerCategory.P7: meta(Group.P, 1, ("Pyr. Liq. 1", "Pyr. Sol. 1")),
    DangerCategory.P8: meta(Group.P, 1, ("Ox. Liq. 1", "Ox. Liq. 2", "Ox. Liq. 3", "Ox. Sol. 1", "Ox. Sol. 2", "Ox. Sol. 3")),

    # E
    DangerCategory.E1: meta(Group.E, 2, ("Aquatic Acute 1", "Aquatic Chronic 1")),
    DangerCategory.E2: meta(Group.E, 4, ("Aquatic Chronic 2",)),

    # O
    DangerCategory.O1: meta(Group.O, 2),
    DangerCategory.O2: meta(Group.O, 2, ("Water-react. 1",)),
    DangerCategory.O3: meta(Group.O, 1),

    # II
    DangerCategory.II1: meta(Group.II, 100),
    DangerCategory.II2: meta(Group.II, 25),
    DangerCategory.II3: meta(Group.II, 7),
    DangerCategory.II4: meta(Group.II, 0.2),
    DangerCategory.II5: meta(Group.II, 100),
    DangerCategory.II6: meta(Group.II, 25),
    DangerCategory.II7: meta(Group.II, 0.02),
    DangerCategory.II8: meta(Group.II, None),
    DangerCategory.II9: meta(Group.II, 0.4),
    DangerCategory.II10: meta(Group.II, 0.2),
    DangerCategory.II11: meta(Group.II, None),
    DangerCategory.II12: meta(Group.II, 0.2),
    DangerCategory.II13: meta(Group.II, 0.2),
    DangerCategory.II14: meta(Group.II, 0.1),
    DangerCategory.II15: meta(Group.II, 0.1),
    DangerCategory.II16: meta(Group.II, 0.5),
    DangerCategory.II17: meta(Group.II, 0.1),
    DangerCategory.II18: meta(Group.II, 1),
    DangerCategory.II19: meta(Group.II, 0.1),
    DangerCategory.II20: meta(Group.II, 0.1),
    DangerCategory.II21: meta(Group.II, 0.1),
    DangerCategory.II22: meta(Group.II, 10),
    DangerCategory.II23: meta(Group.II, None),
    DangerCategory.II24: meta(Group.II, None),
    DangerCategory.II25: meta(Group.II, 4),
    DangerCategory.II26: meta(Group.II, 0.2),
    DangerCategory.II27: meta(Group.II, 0.006),
    DangerCategory.II28: meta(Group.II, 0.004),
    DangerCategory.II29: meta(Group.II, 0.004),
    DangerCategory.II30: meta(Group.II, None),
    DangerCategory.II31: meta(Group.II, 0.3),
    DangerCategory.II32: meta(Group.II, None),
    DangerCategory.II33: meta(Group.II, 0.01),
    DangerCategory.II34: meta(Group.II, 50),
    DangerCategory.II35: meta(Group.II, 1),
    DangerCategory.II36: meta(Group.II, 0.1),
    DangerCategory.II37: meta(Group.II, 0.1),
    DangerCategory.II38: meta(Group.II, 1),
    DangerCategory.II39: meta(Group.II, 1),
    DangerCategory.II40: meta(Group.II, 1),
    DangerCategory.II41: meta(Group.II, 4),
    DangerCategory.II42: meta(Group.II, 10),
    DangerCategory.II43: meta(Group.II, 4),
    DangerCategory.II44: meta(Group.II, 10),
    DangerCategory.II45: meta(Group.II, 2),
    DangerCategory.II46: meta(Group.II, 10),
    DangerCategory.II47: meta(Group.II, 10),
    DangerCategory.II48: meta(Group.II, 10),
}
