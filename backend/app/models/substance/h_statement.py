from typing import Optional

from sqlalchemy import PrimaryKeyConstraint, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base
from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from app.models.substance.property import Property


class HStatement(Base):
    __tablename__ = 'h_statement'
    __table_args__ = (
        PrimaryKeyConstraint('code', name='h_statement_pk'),
    )

    code: Mapped[str] = mapped_column(String(20), primary_key=True)
    description: Mapped[Optional[str]] = mapped_column(Text)

    property: Mapped[list['Property']] = relationship('Property', secondary='property_h_statement', back_populates='h_statement')


