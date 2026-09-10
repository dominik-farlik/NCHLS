import uuid
from typing import Optional, TYPE_CHECKING

from sqlalchemy import ForeignKeyConstraint, PrimaryKeyConstraint, UniqueConstraint, Integer, Identity, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


if TYPE_CHECKING:
    from app.models.department import Department
    from app.models.role import Role


class Employee(Base):
    __tablename__ = 'employee'
    __table_args__ = (
        ForeignKeyConstraint(['department_id'], ['department.id'], name='employee_department_id_fk'),
        PrimaryKeyConstraint('id', name='employee_pk'),
        UniqueConstraint('email', name='employee_email_u'),
        UniqueConstraint('keycloak_id', name='employee_keycloak_u')
    )

    id: Mapped[int] = mapped_column(Integer, Identity(start=1, increment=1, minvalue=1, maxvalue=2147483647, cycle=False, cache=1), primary_key=True, autoincrement=True)
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    keycloak_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)
    department_id: Mapped[Optional[int]] = mapped_column(Integer)

    department: Mapped[Optional['Department']] = relationship('Department', back_populates='employee')
    role: Mapped[list['Role']] = relationship('Role', secondary='employee_role', back_populates='employee')