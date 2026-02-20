from fastapi import APIRouter, HTTPException, Query

from constants.h_phrase import HPhrase
from constants.properties import PROPERTIES
from constants.protocol_categories import DangerCategory
from constants.unit import Unit
from constants.physical_form import PhysicalForm, FormAddition
from db.departments import fetch_departments, fetch_department_by_name

router = APIRouter()


@router.get("/units")
async def get_units():
    return [v.value for v in Unit]


@router.get("/properties")
async def get_properties():
    return PROPERTIES


@router.get("/physical_forms")
async def get_physical_forms():
    return [v.value for v in PhysicalForm]


@router.get("/departments")
async def get_departments():
    cursor = fetch_departments()
    departments = list(cursor)
    for department in departments:
        department["department_id"] = str(department.pop("_id"))
    return departments


@router.get("/departments/by_name")
async def get_department_by_name(name: str = Query(...)):
    return fetch_department_by_name(name)


@router.get("/categories/{prop}")
async def get_categories(prop: str):
    if prop not in PROPERTIES:
        raise HTTPException(status_code=404, detail=f"Property '{prop}' not found")
    return sorted(PROPERTIES[prop].get("categories", []))


@router.get("/exposure_routes/{prop}")
async def get_exposure_routes(prop: str):
    if prop not in PROPERTIES:
        raise HTTPException(status_code=404, detail=f"Property '{prop}' not found")
    return sorted(PROPERTIES[prop].get("exposure_routes", []))


@router.get("/form_additions")
async def get_form_additions():
    return [v.value for v in FormAddition]


@router.get("/h_phrases")
async def get_h_phrases():
    return [v.value for v in HPhrase]


@router.get("/danger_categories")
async def get_danger_categories():
    return [v.value for v in DangerCategory]
