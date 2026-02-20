from fastapi import HTTPException

from backend.db.connection import db


def fetch_departments():
    """Fetch all departments from the collection."""
    return db.departments.find({})


def fetch_department_by_name(name: str) -> dict:
    doc = db.departments.find_one({"name": name})
    if not doc:
        raise HTTPException(status_code=404, detail="Oddělení nenalezeno.")
    doc["_id"] = str(doc["_id"])
    return doc


def db_add_responsible_employee(employee: str, department_name: str) -> dict:
    employee = (employee or "").strip()
    department_name = (department_name or "").strip()

    if not department_name:
        raise HTTPException(status_code=400, detail="Název oddělení nesmí být prázdný.")

    res = db.departments.update_one(
        {"name": department_name}, {"$set": {"responsible_employee": employee}}
    )

    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Oddělení nenalezeno.")

    return {"updated": True, "modified": res.modified_count == 1, "responsible_employee": employee}
