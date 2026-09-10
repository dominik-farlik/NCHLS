from typing import Optional, TYPE_CHECKING

from pydantic import BaseModel
from sqlalchemy import ForeignKeyConstraint, PrimaryKeyConstraint, Integer, Identity, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


if TYPE_CHECKING:
    from app.models.company import Company
    from app.models.department_substance import DepartmentSubstance
    from app.models.employee import Employee


class Department(Base):
    __tablename__ = 'department'
    __table_args__ = (
        ForeignKeyConstraint(['company_id'], ['company.id'], name='department_company_id_fk'),
        PrimaryKeyConstraint('id', name='department_pk')
    )

    id: Mapped[int] = mapped_column(Integer, Identity(start=1, increment=1, minvalue=1, maxvalue=2147483647, cycle=False, cache=1), primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    company_id: Mapped[int] = mapped_column(Integer, nullable=False)
    manager: Mapped[Optional[str]] = mapped_column(String(255))
    code: Mapped[Optional[int]] = mapped_column(Integer)

    company: Mapped['Company'] = relationship('Company', back_populates='department')
    substances: Mapped[list['DepartmentSubstance']] = relationship('DepartmentSubstance', back_populates='department')
    employee: Mapped[list['Employee']] = relationship('Employee', back_populates='department')


class DepartmentBase(BaseModel):
    name: str
    company_id: int
    manager: Optional[str] = None
    code: Optional[int] = None


class DepartmentRead(DepartmentBase):
    id: int