from typing import TYPE_CHECKING, Optional

from sqlalchemy import (
    Boolean,
    ForeignKey,
    ForeignKeyConstraint,
    Identity,
    Integer,
    PrimaryKeyConstraint,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.department import Department
    from app.models.role import Role


class User(Base):
    __tablename__ = "user"
    __table_args__ = (
        ForeignKeyConstraint(["department_id"], ["department.id"], name="user_department_id_fk"),
        PrimaryKeyConstraint("id", name="user_pk"),
        UniqueConstraint("email", name="user_email_u"),
        ForeignKeyConstraint(["role_id"], ["role.id"], name="user_role_id_fk"),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        Identity(start=1, increment=1, minvalue=1, maxvalue=2147483647, cycle=False, cache=1),
        primary_key=True,
        autoincrement=True,
    )
    username: Mapped[str | None] = mapped_column(String(50), unique=True)
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    password: Mapped[str] = mapped_column(String(100), nullable=False)
    department_id: Mapped[int | None] = mapped_column(Integer)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    role_id: Mapped[int] = mapped_column(ForeignKey("role.id"), default=1)

    department: Mapped[Optional["Department"]] = relationship("Department", back_populates="user")
    role: Mapped["Role"] = relationship("Role", back_populates="user")
