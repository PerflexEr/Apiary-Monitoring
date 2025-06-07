"""add description to hive

Revision ID: add_description_to_hive
Revises: create_hive_tables
Create Date: 2024-03-19 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_description_to_hive'
down_revision: Union[str, None] = 'create_hive_tables'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('hives', sa.Column('description', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('hives', 'description') 