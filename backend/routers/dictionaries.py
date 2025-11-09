from fastapi import APIRouter, HTTPException
from constants.property_dicts import Unit, PROPERTIES, PhysicalForm

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
    from db.repo import fetch_departments
    from bson.json_util import dumps
    import json
    cursor = fetch_departments()
    return json.loads(dumps(cursor))

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
