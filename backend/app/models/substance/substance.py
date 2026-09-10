from typing import Optional, TYPE_CHECKING

from pydantic import ConfigDict, BaseModel
from sqlalchemy import ForeignKeyConstraint, PrimaryKeyConstraint, UniqueConstraint, Index, Integer, Identity, String, \
    Boolean, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.substance.property import PropertyBase
from app.models.department_substance import SubstanceDepartments
from app.models.substance.hazard_category import HazardCategoryBase

if TYPE_CHECKING:
    from app.models.company import Company
    from app.models.department_substance import DepartmentSubstance
    from app.models.substance.physical_form import PhysicalForm
    from app.models.substance.unit import Unit
    from app.models.substance.property import Property
    from app.models.substance.hazard_category import HazardCategory


class Substance(Base):
    __tablename__ = 'substance'
    __table_args__ = (
        ForeignKeyConstraint(['company_id'], ['company.id'], name='substance_company_id_fk'),
        ForeignKeyConstraint(['physical_form'], ['physical_form.name'], name='substance_physical_form_name_fk'),
        ForeignKeyConstraint(['unit'], ['unit.name'], name='substance_unit_name_fk'),
        PrimaryKeyConstraint('id', name='substance_pk'),
        UniqueConstraint('code', name='substance_code_u'),
        UniqueConstraint('name', name='substance_name_u'),
        Index('substance_company_code_idx', 'company_id', 'code', postgresql_where='((code IS NOT NULL) AND (company_id IS NOT NULL))', unique=True),
        Index('substance_company_name_idx', 'company_id', 'name', postgresql_where='(company_id IS NOT NULL)', unique=True),
        Index('substance_global_code_idx', 'code', postgresql_where='((code IS NOT NULL) AND (company_id IS NULL))', unique=True),
        Index('substance_global_name_idx', 'name', postgresql_where='(company_id IS NULL)', unique=True)
    )

    id: Mapped[int] = mapped_column(Integer, Identity(start=1, increment=1, minvalue=1, maxvalue=2147483647, cycle=False, cache=1), primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False, comment='Název látky nebo směsi')
    mixture: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text('true'), comment='Identifikuje zda se jedná o látku nebo směs')
    physical_form_name: Mapped[Optional[str]] = mapped_column("physical_form", String(50), comment='Fyzikální forma (pevná, kapalná, plynná)')
    unit_name: Mapped[Optional[str]] = mapped_column("unit", String(10), comment='Jednotka (g, kg, ml, l)')
    sds_revision_year: Mapped[Optional[int]] = mapped_column(Integer, comment='Rok revize bezpečnostního listu')
    note: Mapped[Optional[str]] = mapped_column(Text, comment='Dodatečná informace o látce, např. desinfekce, IPLP, analyz.')
    water_toxicity_ec50: Mapped[Optional[str]] = mapped_column(String, comment='Koncentrace při 50% úmrtí testovaných jedinců')
    manufacturer: Mapped[Optional[str]] = mapped_column(String, comment='Výrobce látky nebo směsi')
    code: Mapped[Optional[str]] = mapped_column(String(50), comment='Kód látky (pro OKL, nejspíš bude odstraněno)')
    company_id: Mapped[Optional[int]] = mapped_column(Integer)
    sds: Mapped[Optional[str]] = mapped_column(String, comment='Cesta k souboru SDS na serveru')

    hazard_category: Mapped[list['HazardCategory']] = relationship('HazardCategory', secondary='substance_hazard_category', back_populates='substance')
    properties: Mapped[list['Property']] = relationship('Property', secondary='substance_property', back_populates='substance')
    company: Mapped[Optional['Company']] = relationship('Company', back_populates='substance')
    physical_form: Mapped[Optional['PhysicalForm']] = relationship('PhysicalForm', back_populates='substance')
    unit: Mapped[Optional['Unit']] = relationship('Unit', back_populates='substance')
    departments: Mapped[list['DepartmentSubstance']] = relationship('DepartmentSubstance', back_populates='substance')


class SubstanceBase(BaseModel):
    name: str
    mixture: bool = True
    physical_form_name: Optional[str] = None
    unit_name: Optional[str] = None
    properties: Optional[list[PropertyBase]] = None
    sds_revision_year: Optional[int] = None
    note: Optional[str] = None
    water_toxicity_ec50: Optional[str] = None
    manufacturer: Optional[str] = None
    code: Optional[str] = None
    company_id: Optional[int] = None
    sds: Optional[str] = None
    departments: list[SubstanceDepartments] = []
    hazard_category: list[HazardCategoryBase] = []

class SubstanceCreate(SubstanceBase):
    pass

class SubstanceUpdate(BaseModel):
    name: Optional[str] = None
    mixture: Optional[bool] = None
    physical_form_name: Optional[str] = None
    unit_name: Optional[str] = None
    sds_revision_year: Optional[int] = None
    note: Optional[str] = None
    water_toxicity_ec50: Optional[str] = None
    manufacturer: Optional[str] = None
    code: Optional[str] = None
    company_id: Optional[int] = None
    sds: Optional[str] = None

class SubstanceRead(SubstanceBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
