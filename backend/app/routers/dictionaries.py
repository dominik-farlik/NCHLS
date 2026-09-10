from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy import Select
from sqlalchemy.orm import Session

from app.constants.h_phrase import HPhrase
from app.constants.properties import PROPERTIES, PROPERTIES_BY_NAME
from app.constants.protocol_categories import DangerCategory
from app.constants.unit import Unit
from app.constants.physical_form import PhysicalForm, FormAddition
from app.database import get_db
from app.models import Department
from app.schemas.department import DepartmentRead

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
async def get_departments(db: Session = Depends(get_db)) -> list[DepartmentRead]:
    stmt = Select(Department).order_by(Department.name)
    departments = list(db.scalars(stmt).all())
    return departments


@router.get("/departments/by_name")
async def get_department_by_name(
        db: Session = Depends(get_db),
        name: str = Query(...)
):
    stmt = Select(Department).where().order_by(Department.name)
    departments = db.scalars(stmt).all()
    return departments


@router.get("/categories/{prop}")
async def get_categories(prop: str):
    p = PROPERTIES_BY_NAME.get(prop)
    if p is None:
        raise HTTPException(status_code=404, detail=f"Property '{prop}' not found")
    return sorted(p.get("categories", []))


@router.get("/exposure_routes/{prop}")
async def get_exposure_routes(prop: str) -> list[str]:
    p = PROPERTIES_BY_NAME.get(prop)
    if p is None:
        raise HTTPException(status_code=404, detail=f"Property '{prop}' not found")
    return sorted(p.get("exposure_routes", []))


@router.get("/form_additions")
async def get_form_additions():
    return [v.value for v in FormAddition]


@router.get("/h_phrases")
async def get_h_phrases():
    return [v.value for v in HPhrase]


@router.get("/danger_categories")
async def get_danger_categories():
    return [v.value for v in DangerCategory]
