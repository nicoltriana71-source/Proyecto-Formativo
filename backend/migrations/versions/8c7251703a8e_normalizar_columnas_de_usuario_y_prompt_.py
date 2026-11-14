"""normalizar columnas de usuario y prompt_ia

Revision ID: 8c7251703a8e
Revises: f5bd2a5faef5
Create Date: 2026-11-13 18:23:51.994233

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8c7251703a8e'
down_revision: Union[str, Sequence[str], None] = 'f5bd2a5faef5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "prompt_ia",
        "embedding",
        existing_type=sa.String(),
        type_=sa.Text(),
        existing_nullable=True,
    )
    op.alter_column(
        "usuario",
        "acepto_terminos",
        existing_type=sa.Boolean(),
        server_default=sa.text("false"),
        existing_nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "usuario",
        "acepto_terminos",
        existing_type=sa.Boolean(),
        server_default=None,
        existing_nullable=False,
    )
    op.alter_column(
        "prompt_ia",
        "embedding",
        existing_type=sa.Text(),
        type_=sa.String(),
        existing_nullable=True,
    )
