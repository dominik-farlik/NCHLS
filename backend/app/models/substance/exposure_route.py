from sqlalchemy import PrimaryKeyConstraint, String
from sqlalchemy.orm import mapped_column, Mapped, relationship

from app.models import Base
from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from app.models.substance.property import Property


class ExposureRoute(Base):
    __tablename__ = 'exposure_route'
    __table_args__ = (
        PrimaryKeyConstraint('route', name='exposure_route_pk'),
    )

    route: Mapped[str] = mapped_column(String(20), primary_key=True)

    property: Mapped[list['Property']] = relationship('Property', back_populates='exposure_route')