from typing import TYPE_CHECKING

from sqlalchemy import PrimaryKeyConstraint, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base

if TYPE_CHECKING:
    from app.models.substance.substance import Substance


class Unit(Base):
    __tablename__ = "unit"
    __table_args__ = (PrimaryKeyConstraint("name", name="unit_pk"),)

    name: Mapped[str] = mapped_column(String(10), primary_key=True)

    substance: Mapped[list["Substance"]] = relationship("Substance", back_populates="unit")
