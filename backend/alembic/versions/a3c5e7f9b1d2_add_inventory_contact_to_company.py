"""add inventory_contact attribute to table company

Revision ID: a3c5e7f9b1d2
Revises: e291c56fac82
Create Date: 2026-11-17 12:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a3c5e7f9b1d2"
down_revision: str | Sequence[str] | None = "e291c56fac82"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "company",
        sa.Column(
            "inventory_contact",
            sa.Text(),
            nullable=True,
            comment="Kontaktní údaje na konci dokumentu inventarizace",
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("company", "inventory_contact")
