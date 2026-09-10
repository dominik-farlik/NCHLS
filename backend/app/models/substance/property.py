from typing import Optional, TYPE_CHECKING

from pydantic import BaseModel
from sqlalchemy import ForeignKeyConstraint, PrimaryKeyConstraint, Integer, Identity, String
from sqlalchemy.orm import mapped_column, Mapped, relationship

from app.models import Base
from app.models.substance.h_statement import HStatementBase
from app.models.substance.hazard_category import HazardCategoryBase


if TYPE_CHECKING:
    from app.models.substance.substance import Substance
    from app.models.substance.hazard_class import HazardClass
    from app.models.substance.h_statement import HStatement
    from app.models.substance.category import Category
    from app.models.substance.exposure_route import ExposureRoute
    from app.models.substance.hazard_category import HazardCategory


class Property(Base):
    __tablename__ = 'property'
    __table_args__ = (
        ForeignKeyConstraint(['category'], ['category.code'], name='property_category_code_fk'),
        ForeignKeyConstraint(['exposure_route'], ['exposure_route.route'], name='property_exposure_route_route_fk'),
        ForeignKeyConstraint(['name'], ['hazard_class.name'], onupdate='CASCADE', name='property_hazard_class_name_fk'),
        PrimaryKeyConstraint('id', name='property_pk'),
        {'comment': 'Vlastnost látky'}
    )

    id: Mapped[int] = mapped_column(Integer, Identity(start=1, increment=1, minvalue=1, maxvalue=2147483647, cycle=False, cache=1), primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False, comment='Název vlastnosti látky (Acute tox., Skin corr., ...)')
    category_name: Mapped[Optional[str]] = mapped_column("category", String(10), comment='Kategorie vlastnosti (1, 2, 1A, ...)')
    exposure_route_name: Mapped[Optional[str]] = mapped_column("exposure_route", String(20), comment='Cesta expozice (oral, inhal, dermal)')

    h_statement: Mapped[list['HStatement']] = relationship('HStatement', secondary='property_h_statement', back_populates='property')
    hazard_category: Mapped[list['HazardCategory']] = relationship('HazardCategory', secondary='clp_classification', back_populates='property')
    category: Mapped[Optional['Category']] = relationship('Category', back_populates='property')
    exposure_route: Mapped[Optional['ExposureRoute']] = relationship('ExposureRoute', back_populates='property')
    hazard_class: Mapped['HazardClass'] = relationship('HazardClass', back_populates='property')
    substance: Mapped[list['Substance']] = relationship('Substance', secondary='substance_property', back_populates='properties')

class PropertyBase(BaseModel):
    name: str
    category_name: Optional[str] = None
    exposure_route_name: Optional[str] = None
    h_statement: Optional[list[HStatementBase]] = None
    hazard_category: Optional[list[HazardCategoryBase]] = None