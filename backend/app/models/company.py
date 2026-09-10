from sqlalchemy import PrimaryKeyConstraint, Integer, Identity, String
from sqlalchemy.orm import mapped_column, Mapped, relationship
from typing import TYPE_CHECKING

from app.models.base import Base


if TYPE_CHECKING:
    from app.models.department import Department
    from app.models.substance.substance import Substance


class Company(Base):
    __tablename__ = 'company'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='company_pk'),
    )

    id: Mapped[int] = mapped_column(Integer, Identity(start=1, increment=1, minvalue=1, maxvalue=2147483647, cycle=False, cache=1), primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)

    department: Mapped[list['Department']] = relationship('Department', back_populates='company')
    substance: Mapped[list['Substance']] = relationship('Substance', back_populates='company')