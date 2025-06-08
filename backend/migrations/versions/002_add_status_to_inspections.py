"""add status column to inspections table

Revision ID: 002
Revises: 001
Create Date: 2024-06-06 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('inspections', sa.Column('status', sa.String(), nullable=True))

def downgrade():
    op.drop_column('inspections', 'status')
