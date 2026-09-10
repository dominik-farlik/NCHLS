from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database import get_db
from app.models.department_substance import DepartmentSubstance, DepartmentSubstanceRead, DepartmentSubstanceCreate, \
    DepartmentSubstanceUpdate

router = APIRouter()


@router.get("/")
async def read_department_substances(
        db: Session = Depends(get_db),
        department_id: int | None = None,
        year: int | None = None
) -> list[DepartmentSubstanceRead]:
    stmt = select(DepartmentSubstance)
    if department_id is not None:
        stmt = stmt.where(DepartmentSubstance.department_id == department_id)
    if year is not None:
        stmt = stmt.where(DepartmentSubstance.year == year)

    records = list(db.scalars(stmt))
    return [DepartmentSubstanceRead.model_validate(r) for r in records]


@router.get("/{department_id}/{substance_id}/{year}", response_model=DepartmentSubstanceRead)
async def read_department_substance(
        department_id: int,
        substance_id: int,
        year: int,
        db: Session = Depends(get_db)
) -> DepartmentSubstanceRead:
    db_record = db.get(DepartmentSubstance, (substance_id, department_id, year))
    if not db_record:
        raise HTTPException(status_code=404, detail="Záznam nenalezen.")
    return DepartmentSubstanceRead.model_validate(db_record)


@router.post("", status_code=201, response_model=DepartmentSubstanceRead)
async def create_department_substance(
        record_data: DepartmentSubstanceCreate,
        db: Session = Depends(get_db)
) -> DepartmentSubstanceRead:
    db_record = DepartmentSubstance(**record_data.model_dump())

    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    return DepartmentSubstanceRead.model_validate(db_record)


@router.patch("/{department_id}/{substance_id}/{year}", response_model=DepartmentSubstanceRead)
async def update_department_substance(
        department_id: int,
        substance_id: int,
        year: int,
        record_data: DepartmentSubstanceUpdate,
        db: Session = Depends(get_db)
) -> DepartmentSubstanceRead:
    db_record = db.get(DepartmentSubstance, (substance_id, department_id, year))
    if not db_record:
        raise HTTPException(status_code=404, detail="Záznam nenalezen.")

    update_data = record_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_record, key, value)

    db.commit()
    db.refresh(db_record)

    return DepartmentSubstanceRead.model_validate(db_record)


@router.get("/years")
def get_years(db: Session = Depends(get_db)):
    stmt = select(DepartmentSubstance.year).distinct()
    return db.scalars(stmt).all()


@router.delete("/{department_id}/{substance_id}/{year}", status_code=200)
async def delete_department_substance(
        department_id: int,
        substance_id: int,
        year: int,
        db: Session = Depends(get_db)
) -> dict:
    db_record = db.get(DepartmentSubstance, (substance_id, department_id, year))
    if not db_record:
        raise HTTPException(status_code=404, detail="Záznam nenalezen.")

    db.delete(db_record)
    db.commit()

    return {"message": "Record successfully deleted"}