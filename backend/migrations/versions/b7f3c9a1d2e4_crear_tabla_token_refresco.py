"""crear tabla token_refresco

Revision ID: b7f3c9a1d2e4
Revises: 8c7251703a8e
Create Date: 2026-11-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b7f3c9a1d2e4"
down_revision: Union[str, Sequence[str], None] = "8c7251703a8e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Crea la tabla de refresh tokens (sesiones renovables)."""
    op.create_table(
        "token_refresco",
        sa.Column("id_token", sa.Integer(), nullable=False),
        sa.Column("id_usuario", sa.Integer(), nullable=False),
        sa.Column("token_hash", sa.String(length=64), nullable=False),
        sa.Column("expira_en", sa.DateTime(), nullable=False),
        sa.Column(
            "revocado",
            sa.Boolean(),
            server_default=sa.text("false"),
            nullable=False,
        ),
        sa.Column("creado_en", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["id_usuario"],
            ["usuario.id_usuario"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id_token"),
    )
    op.create_index(
        op.f("ix_token_refresco_id_usuario"),
        "token_refresco",
        ["id_usuario"],
        unique=False,
    )
    op.create_index(
        op.f("ix_token_refresco_token_hash"),
        "token_refresco",
        ["token_hash"],
        unique=True,
    )


def downgrade() -> None:
    """Elimina la tabla de refresh tokens."""
    op.drop_index(op.f("ix_token_refresco_token_hash"), table_name="token_refresco")
    op.drop_index(op.f("ix_token_refresco_id_usuario"), table_name="token_refresco")
    op.drop_table("token_refresco")
