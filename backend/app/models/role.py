from typing import Optional, TYPE_CHECKING

from sqlalchemy import PrimaryKeyConstraint, UniqueConstraint, Integer, Identity, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


if TYPE_CHECKING:
    from app.models.employee import Employee


class Role(Base):
    __tablename__ = 'role'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='role_pk'),
        UniqueConstraint('name', name='role_name_u')
    )

    id: Mapped[int] = mapped_column(Integer, Identity(start=1, increment=1, minvalue=1, maxvalue=2147483647, cycle=False, cache=1), primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)

    employee: Mapped[list['Employee']] = relationship('Employee', secondary='employee_role', back_populates='role')