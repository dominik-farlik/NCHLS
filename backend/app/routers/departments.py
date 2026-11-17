from urllib.parse import quote

from fastapi import APIRouter, HTTPException, Response
from sqlalchemy import Select
from starlette import status

from app.dependencies import SessionDep
from app.models import Department
from app.reports.inventory import build_report, render_docx, render_pdf
from app.schemas.department import DepartmentRead, DepartmentUpdate
from app.schemas.inventory_report import InventoryReportDefaults, InventoryReportRequest

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


@router.get("/{department_id}/inventory-report/defaults", response_model=InventoryReportDefaults)
async def get_inventory_report_defaults(department_id: int, db: SessionDep):
    department = db.get(Department, department_id)
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Oddělení nebylo nalezeno."
        )
    return InventoryReportDefaults(
        responsible_employee=department.manager or "",
        contact=department.company.inventory_contact or "",
    )


@router.post("/{department_id}/inventory-report")
async def export_inventory_report(
    department_id: int, data: InventoryReportRequest, db: SessionDep
) -> Response:
    department = db.get(Department, department_id)
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Oddělení nebylo nalezeno."
        )

    # Kontaktní údaje jsou společné pro celou společnost – zapamatujeme si poslední vyplněné.
    if data.contact != (department.company.inventory_contact or ""):
        department.company.inventory_contact = data.contact
        db.commit()

    report = build_report(
        db,
        department,
        year=data.year,
        responsible_employee=data.responsible_employee,
        date=data.date,
        performed_by=data.performed_by,
        contact=data.contact,
    )

    filename = f"Inventarizace {data.year} - {department.code or ''} {department.name}".strip()
    if data.format == "docx":
        content = render_docx(report)
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    else:
        content = render_pdf(report)
        media_type = "application/pdf"

    return Response(
        content=content,
        media_type=media_type,
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{quote(filename)}.{data.format}"
        },
    )
