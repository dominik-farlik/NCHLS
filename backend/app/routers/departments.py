from fastapi import APIRouter, HTTPException
from sqlalchemy import Select
from starlette import status

from app.dependencies import SessionDep
from app.models import Department
from app.schemas.department import DepartmentRead, DepartmentUpdate

router = APIRouter()


@router.get("")
async def get_departments(db: SessionDep) -> list[DepartmentRead]:
    stmt: Select[tuple[Department]] = Select(Department).order_by(Department.code)
    departments = list(db.scalars(stmt).all())
    return [DepartmentRead.model_validate(dept) for dept in departments]

@router.get("/{department_id}")
async def get_department(department_id: int, db: SessionDep):
    stmt: Select[tuple[Department]] = Select(Department).where(Department.id == department_id)
    departments = db.scalars(stmt).first()
    return departments


@router.patch("/{department_id}", status_code=200)
async def update_departments(department_id: int, department_data: DepartmentUpdate, db: SessionDep):
    department = db.get(Department, department_id)
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Oddělení nebylo nalezeno."
        )

    update_data = department_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(department, key, value)

    db.commit()
    db.refresh(department)

    return {"message": "Oddělení bylo upraveno.", "department": department}
