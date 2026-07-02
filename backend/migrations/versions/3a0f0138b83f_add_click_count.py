"""add click count

Revision ID: 3a0f0138b83f
Revises: 969ce9c2610c
Create Date: 2026-07-01 17:09:42.958035

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3a0f0138b83f'
down_revision: Union[str, Sequence[str], None] = '969ce9c2610c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('urls', sa.Column('click_count', sa.Integer(), nullable=False))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('urls', 'click_count')
