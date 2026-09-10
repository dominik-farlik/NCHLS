from sqlalchemy import PrimaryKeyConstraint, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.substance.property import Property


class Category(Base):
    __tablename__ = 'category'
    __table_args__ = (
        PrimaryKeyConstraint('code', name='category_pk'),
    )

    code: Mapped[str] = mapped_column(String(10), primary_key=True)

    property: Mapped[list['Property']] = relationship('Property', back_populates='category')