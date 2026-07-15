"""add node coordinates

Revision ID: 5a892b123456
Revises: 987acc97ff70
Create Date: 2026-07-13 15:15:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '5a892b123456'
down_revision = '987acc97ff70'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add layout_x and layout_y columns to stadium_nodes
    op.add_column('stadium_nodes', sa.Column('layout_x', sa.Float(), nullable=False, server_default='0.0'))
    op.add_column('stadium_nodes', sa.Column('layout_y', sa.Float(), nullable=False, server_default='0.0'))

def downgrade() -> None:
    # Remove layout_x and layout_y columns
    op.drop_column('stadium_nodes', 'layout_y')
    op.drop_column('stadium_nodes', 'layout_x')
