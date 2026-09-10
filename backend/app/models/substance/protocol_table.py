from typing import Optional, TYPE_CHECKING

from sqlalchemy import PrimaryKeyConstraint, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base


if TYPE_CHECKING:
    from app.models.substance.hazard_category import HazardCategory


class ProtocolTable(Base):
    __tablename__ = 'protocol_table'
    __table_args__ = (
        PrimaryKeyConstraint('name', name='protocol_table_pk'),
    )

    name: Mapped[str] = mapped_column(String(20), primary_key=True)
    description: Mapped[Optional[str]] = mapped_column(String(100))

    hazard_category: Mapped[list['HazardCategory']] = relationship('HazardCategory', back_populates='protocol_table')