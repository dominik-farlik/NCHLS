from fastapi import APIRouter, Depends
from sqlalchemy import Select
from sqlmodel import Session

from app.database import get_db
from app.models import Department
from app.schemas.department import DepartmentRead

router = APIRouter()


@router.get("")
async def get_departments(db: Session = Depends(get_db)) -> list[DepartmentRead]:
    stmt = Select(Department).order_by(Department.code)
    departments = list(db.scalars(stmt).all())
    return departments