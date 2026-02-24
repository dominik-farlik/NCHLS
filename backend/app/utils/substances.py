from app.constants.unit import to_tons
from app.db.records import fetch_amount_sum_substance, fetch_substance_departments


def get_substance_max_tons(substance_id: str) -> float:
    amount_docs = list(fetch_amount_sum_substance(substance_id))
    if amount_docs and "unit" in amount_docs[0]:
        total_amount = amount_docs[0]["total_amount"]
        unit = amount_docs[0]["unit"]
        return to_tons(total_amount, unit)

    return 0


def get_substance_departments(substance_id: str) -> list:
    departments_docs = list(fetch_substance_departments(substance_id))
    return departments_docs[0]["departments"] if departments_docs else []
