import shutil

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Path
from sqlalchemy.orm import Session
from sqlmodel import select
from starlette.responses import FileResponse

from app.database import get_db
from app.models import Substance
from app.models.substance.substance import SubstanceRead, SubstanceCreate, SubstanceUpdate
from config import get_settings

router = APIRouter()

@router.get("/")
async def read_substances(
        db: Session = Depends(get_db),
        department_name: str | None = None,
        year: int | None = None
        ) -> list[SubstanceRead]:
    stmt = select(Substance)
    substances = list(db.scalars(stmt).all())
    return substances

@router.get("/{substance_id}")
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

    file_path = get_settings().UPLOAD_DIR / f"{substance_id}"

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
    db_substance = Substance(**substance_data.model_dump())

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

    for key, value in update_data.items():
        setattr(db_substance, key, value)

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
