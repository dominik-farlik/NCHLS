import decimal
from typing import TYPE_CHECKING, Optional

from pydantic import BaseModel, ConfigDict
from sqlalchemy import ForeignKeyConstraint, PrimaryKeyConstraint, Index, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.department import DepartmentRead


if TYPE_CHECKING:
    from app.models.department import Department
    from app.models.substance.substance import Substance


class DepartmentSubstance(Base):
    __tablename__ = 'department_substance'
    __table_args__ = (
        ForeignKeyConstraint(['department_id'], ['department.id'], ondelete='CASCADE', name='department_substance_department_id_fk'),
        ForeignKeyConstraint(['substance_id'], ['substance.id'], ondelete='CASCADE', name='department_substance_substance_id_fk'),
        PrimaryKeyConstraint('substance_id', 'department_id', 'year', name='department_substance_pk'),
        Index('idx_department_substance_department_id', 'department_id')
    )

    department_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    substance_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    year: Mapped[int] = mapped_column(Integer, primary_key=True)
    amount: Mapped[decimal.Decimal] = mapped_column(Numeric, nullable=False)

    department: Mapped['Department'] = relationship('Department', back_populates='substances')
    substance: Mapped['Substance'] = relationship('Substance', back_populates='departments')


class DepartmentSubstanceBase(BaseModel):
    department_id: int
    substance_id: int
    year: int
    amount: decimal.Decimal

class DepartmentSubstanceCreate(DepartmentSubstanceBase):
    pass

class DepartmentSubstanceUpdate(BaseModel):
    amount: Optional[decimal.Decimal] = None

class DepartmentSubstanceRead(DepartmentSubstanceBase):
    model_config = ConfigDict(from_attributes=True)

class SubstanceDepartments(BaseModel):
    department: DepartmentRead
    year: int
    amount: decimal.Decimal