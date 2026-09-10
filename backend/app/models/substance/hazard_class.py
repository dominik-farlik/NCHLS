from typing import Optional

from sqlalchemy import PrimaryKeyConstraint, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base
from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from app.models.substance.property import Property


class HazardClass(Base):
    __tablename__ = 'hazard_class'
    __table_args__ = (
        PrimaryKeyConstraint('name', name='hazard_class_pk'),
    )

    name: Mapped[str] = mapped_column(String(50), primary_key=True)
    description: Mapped[Optional[str]] = mapped_column(Text)

    property: Mapped[list['Property']] = relationship('Property', back_populates='hazard_class')