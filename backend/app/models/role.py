from typing import TYPE_CHECKING

from sqlalchemy import Identity, Integer, PrimaryKeyConstraint, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class Role(Base):
    __tablename__ = "role"
    __table_args__ = (
        PrimaryKeyConstraint("id", name="role_pk"),
        UniqueConstraint("name", name="role_name_u"),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        Identity(start=1, increment=1, minvalue=1, maxvalue=2147483647, cycle=False, cache=1),
        primary_key=True,
        autoincrement=True,
    )
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    user: Mapped[list["User"]] = relationship("User", secondary="user_role", back_populates="role")
