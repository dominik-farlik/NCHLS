import decimal
from typing import Optional

from sqlalchemy import PrimaryKeyConstraint, String, Text, ForeignKeyConstraint, UniqueConstraint, Integer, Identity, \
    Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base
from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from app.models.substance.substance import Substance
    from app.models.substance.property import Property
    from app.models.substance.protocol_table import ProtocolTable


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
