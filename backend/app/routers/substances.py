import shutil
from pathlib import Path

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlmodel import select
from starlette import status
from starlette.responses import FileResponse

from app.database import get_db
from app.models import Substance, DepartmentSubstance, Department, Property
from app.schemas.substance.substance import SubstanceRead, SubstanceCreate, SubstanceUpdate, SubstancePaginationRead
from config import get_settings

router = APIRouter()


@router.get("/", response_model=SubstancePaginationRead)
async def read_substances(
        db: Session = Depends(get_db),
        limit: int = 100,
        offset: int = 0,
        order_by: str = "name",
        desc: bool = False,
        department_name: str | None = None,
        year: int | None = None,
        search: str | None = None,
):
    order_column = getattr(Substance, order_by, Substance.name)
    order_clause = order_column.desc() if desc else order_column.asc()

    stmt = select(Substance)
    count_stmt = select(func.count(Substance.id.distinct()))

    def apply_filters(query):
        if department_name or year:
            query = query.join(Substance.departments)

        if department_name:
            query = query.join(DepartmentSubstance.department)
            query = query.where(Department.name == department_name)

        if year:
            query = query.where(DepartmentSubstance.year == year)

        if search:
            query = query.where(Substance.name.ilike(f"%{search}%"))

        return query

    stmt = apply_filters(stmt)
    count_stmt = apply_filters(count_stmt)

    total = db.scalar(count_stmt) or 0

    stmt = stmt.distinct().limit(limit).offset(offset).order_by(order_clause)
    substances = list(db.scalars(stmt).all())

    return {
        "items": substances,
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.get("/{substance_id}", response_model=SubstanceRead)
async def read_substance(
        substance_id: int,
        db: Session = Depends(get_db)
) -> SubstanceRead:
    stmt = select(Substance).where(Substance.id == substance_id)
    substance = db.scalars(stmt).first()

    if not substance:
        raise HTTPException(status_code=404, detail="Substance not found")
    return substance


@router.post("/{substance_id}/sds", response_model=SubstanceRead)
async def upload_substance_sds(
        substance_id: int,
        file: UploadFile = File(...),
        db: Session = Depends(get_db)
) -> SubstanceRead:
    db_substance = db.get(Substance, substance_id)
    if not db_substance:
        raise HTTPException(status_code=404, detail="Substance not found")

    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    file_path = get_settings().UPLOAD_DIR / f"{substance_id}.pdf"

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db_substance.sds = str(file_path)
    db.commit()
    db.refresh(db_substance)

    return SubstanceRead.model_validate(db_substance)


@router.get("/{substance_id}/sds")
async def get_substance_sds(
        substance_id: int,
        db: Session = Depends(get_db)
) -> FileResponse:
    db_substance = db.get(Substance, substance_id)
    if not db_substance or not db_substance.sds:
        raise HTTPException(status_code=404, detail="SDS file not found")

    file_path = Path(db_substance.sds)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File on server not found")

    return FileResponse(path=file_path, media_type="application/pdf", filename=file_path.name)


@router.post("/", status_code=201, response_model=SubstanceRead)
async def create_substance(
        substance_data: SubstanceCreate,
        db: Session = Depends(get_db)
) -> SubstanceRead:
    existing_substance = db.scalars(select(Substance).where(Substance.name == substance_data.name)).first()
    if existing_substance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Látka s tímto názvem již existuje.",
        )
    data = substance_data.model_dump(exclude={"property_ids", "properties"})
    db_substance = Substance(**data)

    if "property_ids" in substance_data:
        property_ids = substance_data.pop("property_ids")
        if property_ids is not None:
            valid_property_ids = [pid for pid in property_ids if pid not in (None, "")]

            if valid_property_ids:
                properties = db.execute(
                    select(Property).where(Property.id.in_(valid_property_ids))
                ).scalars().all()
                db_substance.properties = list(properties)
            else:
                db_substance.properties = []

    db.add(db_substance)
    db.commit()
    db.refresh(db_substance)

    return SubstanceRead.model_validate(db_substance)


@router.patch("/{substance_id}", response_model=SubstanceRead)
async def update_substance(
        substance_id: int,
        substance_data: SubstanceUpdate,
        db: Session = Depends(get_db)
) -> SubstanceRead:
    db_substance = db.get(Substance, substance_id)
    if not db_substance:
        raise HTTPException(status_code=404, detail="Substance not found")

    update_data = substance_data.model_dump(exclude_unset=True)

    if "property_ids" in update_data:
        property_ids = update_data.pop("property_ids")
        if property_ids is not None:
            valid_property_ids = [pid for pid in property_ids if pid not in (None, "")]

            if valid_property_ids:
                properties = db.execute(
                    select(Property).where(Property.id.in_(valid_property_ids))
                ).scalars().all()
                db_substance.properties = list(properties)
            else:
                db_substance.properties = []

    for key, value in update_data.items():
        setattr(db_substance, key, value)

    db.add(db_substance)
    db.commit()
    db.refresh(db_substance)

    return SubstanceRead.model_validate(db_substance)


@router.delete("/{substance_id}", status_code=200)
async def delete_substance(
        substance_id: int,
        db: Session = Depends(get_db)
) -> dict:
    db_substance = db.get(Substance, substance_id)
    if not db_substance:
        raise HTTPException(status_code=404, detail="Substance not found")

    db.delete(db_substance)
    db.commit()

    return {"message": "Substance successfully deleted"}
