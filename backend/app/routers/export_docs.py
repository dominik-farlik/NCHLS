import csv
from datetime import datetime
from io import StringIO

from fastapi import APIRouter, Query
from fastapi.openapi.models import Response

from app.constants.protocol_categories import DangerCategory, DANGER_META, Group
from app.db.substances import fetch_substances
from app.utils.non_inclusion_protocol import category_code, format_meta_form, format_meta_properties
from app.utils.substances import get_substance_max_tons

router = APIRouter()


@router.get("/non_inclusion_protocol.csv")
async def export_non_inclusion_protocol_csv(
    department_name: str | None = Query(default=None),
    year: int | None = Query(default=None),
):
    filter_: dict[str, str | int] = {}
    if department_name:
        filter_["location_name"] = department_name
    if year is not None:
        filter_["year"] = year

    substances = list(fetch_substances(filter_ if filter_ else None))

    amount_by_cat: dict[DangerCategory, float] = {}
    for s in substances:
        sid = str(s["_id"])
        amount = float(get_substance_max_tons(sid) or 0)

        cat = s.get("danger_category") or DangerCategory.NONE
        if isinstance(cat, str):
            try:
                cat = DangerCategory(cat)
            except ValueError:
                cat = DangerCategory.NONE

        if cat == DangerCategory.NONE:
            continue

        amount_by_cat[cat] = amount_by_cat.get(cat, 0.0) + amount

    output = StringIO()
    writer = csv.writer(output, delimiter=";")

    writer.writerow(
        [
            "látka/směs",
            "množství t",
            "forma",
            "klasifikace",
            "třída",
            "tab. I/II",
            "limit pro A",
            "poměr množství k limitu",
            "H (poměr)",
            "P (poměr)",
            "E (poměr)",
            "O (poměr)",
            "II (poměr)",
        ]
    )

    sum_ratio_H = 0.0
    sum_ratio_P = 0.0
    sum_ratio_E = 0.0
    sum_ratio_O = 0.0
    sum_ratio_II = 0.0

    for cat in sorted(amount_by_cat.keys(), key=lambda c: category_code(c)):
        meta = DANGER_META.get(cat)
        total_amount = amount_by_cat[cat]

        if not meta:
            writer.writerow(
                [
                    category_code(cat),
                    round(total_amount, 6),
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                ]
            )
            continue

        hazard_class = meta.group.value
        tab = meta.table.value

        limit_A = 0.0
        ratio = 0.0

        rH = rP = rE = rO = rII = 0.0

        if meta.threshold is not None:
            limit_value = float(meta.threshold) * 50
            limit_A = limit_value

            if limit_value != 0:
                ratio_val = total_amount / limit_value
                ratio = round(ratio_val, 6)

                if meta.group == Group.HEALTH:
                    rH = ratio
                    sum_ratio_H += ratio_val
                elif meta.group == Group.PHYSICAL:
                    rP = ratio
                    sum_ratio_P += ratio_val
                elif meta.group == Group.ENVIRONMENTAL:
                    rE = ratio
                    sum_ratio_E += ratio_val
                elif meta.group == Group.OTHER:
                    rO = ratio
                    sum_ratio_O += ratio_val
                elif meta.group == Group.TAB_II:
                    rII = ratio
                    sum_ratio_II += ratio_val

        writer.writerow(
            [
                category_code(cat),
                round(total_amount, 6),
                format_meta_form(meta.form),
                format_meta_properties(meta.properties),
                hazard_class,
                tab,
                limit_A,
                ratio,
                rH,
                rP,
                rE,
                rO,
                rII,
            ]
        )

    writer.writerow(
        [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "Součty",
            round(sum_ratio_H, 6),
            round(sum_ratio_P, 6),
            round(sum_ratio_E, 6),
            round(sum_ratio_O, 6),
            round(sum_ratio_II, 6),
        ]
    )

    ts = datetime.now().strftime("%Y-%m-%d_%H-%M")
    filename = f"substances_{ts}.csv"

    csv_data = output.getvalue().encode("utf-8-sig")
    return Response(
        content=csv_data,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

@router.get("/export.csv")
async def export_substances_csv(
    department_name: str | None = Query(default=None),
    year: int | None = Query(default=None),
):
    filter_: dict[str, str | int] = {}
    if department_name:
        filter_["location_name"] = department_name
    if year is not None:
        filter_["year"] = year

    substances = fetch_substances(filter_ if filter_ else None)

    output = StringIO()
    writer = csv.writer(output, delimiter=";")

    writer.writerow(
        [
            "Název",
            "Směs / látka",
            "Fyzikální forma",
            "Doplňky formy",
            "Vlastnosti",
            "Kategorie nebezpečnosti",
            "Max (t)",
            "EC50",
            "Oddělení",
        ]
    )

    for s in substances:
        writer.writerow(
            [
                s.get("name", ""),
                s.get("substance_mixture", ""),
                s.get("physical_form", ""),
                ", ".join(s.get("form_addition", []) or []),
                ", ".join(
                    f"{p.get('name', '')} {p.get('category', '')}"
                    for p in (s.get("properties") or [])
                ),
                s.get("danger_category", ""),
                get_substance_max_tons(str(s["_id"])),
                s.get("water_toxicity_EC50", ""),
                ", ".join(get_substance_departments(str(s["_id"]))),
            ]
        )

    output.seek(0)

    ts = datetime.now().strftime("%Y-%m-%d_%H-%M")
    filename = f"substances_{ts}.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )