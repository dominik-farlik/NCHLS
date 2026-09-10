from sqlalchemy import PrimaryKeyConstraint, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base
from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from app.models.substance.substance import Substance


class PhysicalForm(Base):
    __tablename__ = 'physical_form'
    __table_args__ = (
        PrimaryKeyConstraint('name', name='physical_form_pk'),
    )

    name: Mapped[str] = mapped_column(String(50), primary_key=True)

    substance: Mapped[list['Substance']] = relationship('Substance', back_populates='physical_form')