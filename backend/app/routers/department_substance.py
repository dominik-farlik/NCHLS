from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database import get_db
from app.models import DepartmentSubstance
from app.schemas.department_substance import DepartmentSubstanceRead, DepartmentSubstanceCreate, \
    DepartmentSubstanceUpdate, DepartmentSubstanceDelete

router = APIRouter()


@router.get("", response_model=list[DepartmentSubstanceRead])
async def read_department_substances(
        db: Session = Depends(get_db),
        department_id: int | None = None,
        year: int | None = None
):
    stmt = select(DepartmentSubstance)
    if department_id is not None:
        stmt = stmt.where(DepartmentSubstance.department_id == department_id)
    if year is not None:
        stmt = stmt.where(DepartmentSubstance.year == year)

    records = db.scalars(stmt).all()
    return records


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


@router.patch("", response_model=DepartmentSubstanceRead)
async def update_department_substance(
        update_data: DepartmentSubstanceUpdate,
        db: Session = Depends(get_db)
) -> DepartmentSubstanceRead:
    db_record = db.get(DepartmentSubstance, (update_data.substance_id, update_data.department_id, update_data.year))
    if not db_record:
        raise HTTPException(status_code=404, detail="Záznam nenalezen.")

    update_data = update_data.model_dump(exclude_unset=True)
    print(update_data)

    db_record.amount = update_data["amount"]
    db.commit()
    db.refresh(db_record)

    return DepartmentSubstanceRead.model_validate(db_record)


@router.delete("", status_code=200)
async def delete_department_substance(
        delete_data: DepartmentSubstanceDelete,
        db: Session = Depends(get_db)
) -> dict:
    db_record = db.get(DepartmentSubstance, (delete_data.substance_id, delete_data.department_id, delete_data.year))
    if not db_record:
        raise HTTPException(status_code=404, detail="Záznam nenalezen.")

    db.delete(db_record)
    db.commit()

    return {"message": "Record successfully deleted"}


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


@router.get("/years")
def get_years(db: Session = Depends(get_db)):
    stmt = select(DepartmentSubstance.year).distinct()
    return db.scalars(stmt).all()


@router.post("/bulk", status_code=200)
async def bulk_update_department_substances(
        department_id: int,
        year: int,
        records: list[DepartmentSubstanceCreate],
        db: Session = Depends(get_db)
):
    # 1. Smazat stávající záznamy pro daný rok a oddělení
    stmt = select(DepartmentSubstance).where(
        DepartmentSubstance.department_id == department_id,
        DepartmentSubstance.year == year
    )
    existing_records = db.scalars(stmt).all()
    for record in existing_records:
        db.delete(record)

    # 2. Vložit nové záznamy
    for record_data in records:
        db.add(DepartmentSubstance(**record_data.model_dump()))

    db.commit()
    return {"message": "Stav oddělení byl úspěšně uložen."}
