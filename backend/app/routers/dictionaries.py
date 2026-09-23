from fastapi import APIRouter, Query, Depends
from sqlalchemy import Select
from sqlalchemy.orm import Session

from app.constants.unit import Unit
from app.database import get_db
from app.models import Department, Property, PhysicalForm
from app.schemas.department import DepartmentRead
from app.schemas.substance.physical_form import PhysicalFormBase
from app.schemas.substance.property import PropertyBase

router = APIRouter()


@router.get("/units")
async def get_units():
    return [v.value for v in Unit]


@router.get("/properties", response_model=list[PropertyBase])
async def get_properties(db: Session = Depends(get_db)):
    return db.scalars(Select(Property)).all()


@router.get("/physical_forms", response_model=list[PhysicalFormBase])
async def get_physical_forms(db: Session = Depends(get_db)):
    return db.scalars(Select(PhysicalForm)).all()


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
