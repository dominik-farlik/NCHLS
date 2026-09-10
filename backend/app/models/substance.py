import decimal
from typing import Optional, TYPE_CHECKING

from sqlalchemy import ForeignKeyConstraint, PrimaryKeyConstraint, UniqueConstraint, Index, Integer, Identity, String, \
    Boolean, Text, text, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


if TYPE_CHECKING:
    from app.models.company import Company
    from app.models.department_substance import DepartmentSubstance


class Unit(Base):
    __tablename__ = 'unit'
    __table_args__ = (
        PrimaryKeyConstraint('name', name='unit_pk'),
    )

    name: Mapped[str] = mapped_column(String(10), primary_key=True)

    substance: Mapped[list['Substance']] = relationship('Substance', back_populates='unit_')


class ProtocolTable(Base):
    __tablename__ = 'protocol_table'
    __table_args__ = (
        PrimaryKeyConstraint('name', name='protocol_table_pk'),
    )

    name: Mapped[str] = mapped_column(String(20), primary_key=True)
    description: Mapped[Optional[str]] = mapped_column(String(100))

    hazard_category: Mapped[list['HazardCategory']] = relationship('HazardCategory', back_populates='protocol_table_')


class HazardCategory(Base):
    __tablename__ = 'hazard_category'
    __table_args__ = (
        ForeignKeyConstraint(['protocol_table'], ['protocol_table.name'], name='hazard_category_protocol_table_name_fk'),
        PrimaryKeyConstraint('id', name='hazard_category_pk'),
        UniqueConstraint('code', name='hazard_category_code_u')
    )

    id: Mapped[int] = mapped_column(Integer, Identity(start=1, increment=1, minvalue=1, maxvalue=2147483647, cycle=False, cache=1), primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False, comment='Celý název kategorie (akutní toxicita, výbušniny, ...)')
    section: Mapped[Optional[str]] = mapped_column(String(10), comment='Oddíl (H, P, E, O)')
    max_amount_a: Mapped[Optional[decimal.Decimal]] = mapped_column(Numeric, comment='Maximální skladované množství v tunách pro kategorii A')
    code: Mapped[Optional[str]] = mapped_column(String(10), comment='Kód kategorie nebezpečné látky (H1, P5a, E2, ...)')
    max_amount_b: Mapped[Optional[decimal.Decimal]] = mapped_column(Numeric, comment='Maximální skladované množství v tunách pro kategorii B')
    protocol_table_name: Mapped[Optional[str]] = mapped_column("protocol_table", String(100), comment='Název tabulky, do které látka spadá')
    note: Mapped[Optional[str]] = mapped_column(Text)

    protocol_table: Mapped[Optional['ProtocolTable']] = relationship('ProtocolTable', back_populates='hazard_category')
    property: Mapped[list['Property']] = relationship('Property', secondary='clp_classification', back_populates='hazard_category')
    substance: Mapped[list['Substance']] = relationship('Substance', secondary='substance_hazard_category', back_populates='hazard_category')


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
    substance: Mapped[list['Substance']] = relationship('Substance', secondary='substance_property', back_populates='property')


class ExposureRoute(Base):
    __tablename__ = 'exposure_route'
    __table_args__ = (
        PrimaryKeyConstraint('route', name='exposure_route_pk'),
    )

    route: Mapped[str] = mapped_column(String(20), primary_key=True)

    property: Mapped[list['Property']] = relationship('Property', back_populates='exposure_route_')


class PhysicalForm(Base):
    __tablename__ = 'physical_form'
    __table_args__ = (
        PrimaryKeyConstraint('name', name='physical_form_pk'),
    )

    name: Mapped[str] = mapped_column(String(50), primary_key=True)

    substance: Mapped[list['Substance']] = relationship('Substance', back_populates='physical_form_')


class Category(Base):
    __tablename__ = 'category'
    __table_args__ = (
        PrimaryKeyConstraint('code', name='category_pk'),
    )

    code: Mapped[str] = mapped_column(String(10), primary_key=True)

    property: Mapped[list['Property']] = relationship('Property', back_populates='category_')


class HStatement(Base):
    __tablename__ = 'h_statement'
    __table_args__ = (
        PrimaryKeyConstraint('code', name='h_statement_pk'),
    )

    code: Mapped[str] = mapped_column(String(20), primary_key=True)
    description: Mapped[Optional[str]] = mapped_column(Text)

    property: Mapped[list['Property']] = relationship('Property', secondary='property_h_statement', back_populates='h_statement')


class HazardClass(Base):
    __tablename__ = 'hazard_class'
    __table_args__ = (
        PrimaryKeyConstraint('name', name='hazard_class_pk'),
    )

    name: Mapped[str] = mapped_column(String(50), primary_key=True)
    description: Mapped[Optional[str]] = mapped_column(Text)

    property: Mapped[list['Property']] = relationship('Property', back_populates='hazard_class')


class Substance(Base):
    __tablename__ = 'substance'
    __table_args__ = (
        ForeignKeyConstraint(['company_id'], ['company.id'], name='substance_company_id_fk'),
        ForeignKeyConstraint(['physical_form'], ['physical_form.name'], name='substance_physical_form_name_fk'),
        ForeignKeyConstraint(['unit'], ['unit.name'], name='substance_unit_name_fk'),
        PrimaryKeyConstraint('id', name='substance_pk'),
        UniqueConstraint('code', name='substance_code_u'),
        UniqueConstraint('name', name='substance_name_u'),
        Index('substance_company_code_idx', 'company_id', 'code', postgresql_where='((code IS NOT NULL) AND (company_id IS NOT NULL))', unique=True),
        Index('substance_company_name_idx', 'company_id', 'name', postgresql_where='(company_id IS NOT NULL)', unique=True),
        Index('substance_global_code_idx', 'code', postgresql_where='((code IS NOT NULL) AND (company_id IS NULL))', unique=True),
        Index('substance_global_name_idx', 'name', postgresql_where='(company_id IS NULL)', unique=True)
    )

    id: Mapped[int] = mapped_column(Integer, Identity(start=1, increment=1, minvalue=1, maxvalue=2147483647, cycle=False, cache=1), primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False, comment='Název látky nebo směsi')
    mixture: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text('true'), comment='Identifikuje zda se jedná o látku nebo směs')
    physical_form_name: Mapped[Optional[str]] = mapped_column("physical_form", String(50), comment='Fyzikální forma (pevná, kapalná, plynná)')
    unit_name: Mapped[Optional[str]] = mapped_column("unit", String(10), comment='Jednotka (g, kg, ml, l)')
    sds_revision_year: Mapped[Optional[int]] = mapped_column(Integer, comment='Rok revize bezpečnostního listu')
    note: Mapped[Optional[str]] = mapped_column(Text, comment='Dodatečná informace o látce, např. desinfekce, IPLP, analyz.')
    water_toxicity_ec50: Mapped[Optional[str]] = mapped_column(String, comment='Koncentrace při 50% úmrtí testovaných jedinců')
    manufacturer: Mapped[Optional[str]] = mapped_column(String, comment='Výrobce látky nebo směsi')
    code: Mapped[Optional[str]] = mapped_column(String(50), comment='Kód látky (pro OKL, nejspíš bude odstraněno)')
    company_id: Mapped[Optional[int]] = mapped_column(Integer)
    sds: Mapped[Optional[bool]] = mapped_column(Boolean, comment='true, if sds is saved on server')

    hazard_category: Mapped[list['HazardCategory']] = relationship('HazardCategory', secondary='substance_hazard_category', back_populates='substance')
    property: Mapped[list['Property']] = relationship('Property', secondary='substance_property', back_populates='substance')
    company: Mapped[Optional['Company']] = relationship('Company', back_populates='substance')
    physical_form: Mapped[Optional['PhysicalForm']] = relationship('PhysicalForm', back_populates='substance')
    unit: Mapped[Optional['Unit']] = relationship('Unit', back_populates='substance')
    department_substance: Mapped[list['DepartmentSubstance']] = relationship('DepartmentSubstance', back_populates='substance')