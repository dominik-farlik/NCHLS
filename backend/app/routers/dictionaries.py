from fastapi import APIRouter
from sqlalchemy import Select

from app.constants.unit import Unit
from app.dependencies import SessionDep
from app.models import PhysicalForm, Property
from app.schemas.substance.physical_form import PhysicalFormBase
from app.schemas.substance.property import PropertyBase

router = APIRouter()


@router.get("/units")
async def get_units():
    return [v.value for v in Unit]


@router.get("/properties", response_model=list[PropertyBase])
async def get_properties(db: SessionDep):
    return db.scalars(Select(Property)).all()


@router.get("/physical_forms", response_model=list[PhysicalFormBase])
async def get_physical_forms(db: SessionDep):
    return db.scalars(Select(PhysicalForm)).all()
