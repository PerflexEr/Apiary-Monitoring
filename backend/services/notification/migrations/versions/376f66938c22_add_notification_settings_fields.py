"""add notification settings fields

Revision ID: 376f66938c22
Revises: 001
Create Date: 2025-06-08 14:09:39.134836

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '376f66938c22'
down_revision = '001'
branch_labels = None
depends_on = None

def upgrade():
    # Оставляем только изменения, относящиеся к notification-сервису
    op.alter_column('notification_templates', 'name',
               existing_type=sa.VARCHAR(),
               nullable=True)
    # Если есть новые notification-таблицы/поля — добавить их здесь
    # ### end Alembic commands ###

def downgrade():
    # Оставляем только откат изменений notification-сервиса
    op.alter_column('notification_templates', 'name',
               existing_type=sa.VARCHAR(),
               nullable=False)
    # Если были новые notification-таблицы/поля — удалить их здесь
    # ### end Alembic commands ###
