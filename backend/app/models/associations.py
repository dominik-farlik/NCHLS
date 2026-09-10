from sqlalchemy import Table, Integer, Column, ForeignKeyConstraint, PrimaryKeyConstraint, String, Index

from app.models.base import Base

t_clp_classification = Table(
    'clp_classification', Base.metadata,
    Column('hazard_category_id', Integer, primary_key=True),
    Column('property_id', Integer, primary_key=True),
    ForeignKeyConstraint(['hazard_category_id'], ['hazard_category.id'], name='clp_classification_hazard_category_id_fk'),
    ForeignKeyConstraint(['property_id'], ['property.id'], name='clp_classification_property_id_fk'),
    PrimaryKeyConstraint('hazard_category_id', 'property_id', name='clp_classification_pk')
)


t_property_h_statement = Table(
    'property_h_statement', Base.metadata,
    Column('property_id', Integer, primary_key=True),
    Column('h_statement', String(20), primary_key=True),
    ForeignKeyConstraint(['h_statement'], ['h_statement.code'], ondelete='CASCADE', name='property_h_statement_h_statement_code_fk'),
    ForeignKeyConstraint(['property_id'], ['property.id'], ondelete='CASCADE', name='property_h_statement_property_id_fk'),
    PrimaryKeyConstraint('h_statement', 'property_id', name='property_h_statement_pk')
)


t_substance_hazard_category = Table(
    'substance_hazard_category', Base.metadata,
    Column('substance_id', Integer, primary_key=True),
    Column('hazard_category_id', Integer, primary_key=True),
    ForeignKeyConstraint(['hazard_category_id'], ['hazard_category.id'], ondelete='CASCADE', name='substance_hazard_category_hazard_category_id_fk'),
    ForeignKeyConstraint(['substance_id'], ['substance.id'], ondelete='CASCADE', name='substance_hazard_category_substance_id_fk'),
    PrimaryKeyConstraint('hazard_category_id', 'substance_id', name='substance_hazard_category_pk'),
    Index('idx_substance_hazard_substance_id', 'substance_id')
)


t_substance_property = Table(
    'substance_property', Base.metadata,
    Column('substance_id', Integer, primary_key=True),
    Column('property_id', Integer, primary_key=True),
    ForeignKeyConstraint(['property_id'], ['property.id'], ondelete='CASCADE', name='substance_property_property_id_fk'),
    ForeignKeyConstraint(['substance_id'], ['substance.id'], ondelete='CASCADE', name='substance_property_substance_id_fk'),
    PrimaryKeyConstraint('substance_id', 'property_id', name='substance_property_pk'),
    Index('idx_substance_property_property_id', 'property_id')
)


t_employee_role = Table(
    'employee_role', Base.metadata,
    Column('employee_id', Integer, primary_key=True),
    Column('role_id', Integer, primary_key=True),
    ForeignKeyConstraint(['employee_id'], ['employee.id'], ondelete='CASCADE', name='employee_role_employee_id_fk'),
    ForeignKeyConstraint(['role_id'], ['role.id'], ondelete='CASCADE', name='employee_role_role_id_fk'),
    PrimaryKeyConstraint('employee_id', 'role_id', name='employee_role_pk'),
    Index('idx_employee_role_role_id', 'role_id')
)