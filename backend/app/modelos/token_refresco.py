from datetime import datetime
from typing import Optional

import sqlalchemy as sa
from sqlmodel import Field, SQLModel


class TokenRefresco(SQLModel, table=True):
    """Sesión de larga duración. Guarda solo el hash del token, nunca el token."""

    __tablename__ = "token_refresco"
    __table_args__ = {"extend_existing": True}

    id_token: Optional[int] = Field(default=None, primary_key=True)
    id_usuario: int = Field(
        sa_column=sa.Column(
            sa.Integer,
            sa.ForeignKey("usuario.id_usuario", ondelete="CASCADE"),
            nullable=False,
            index=True,
        )
    )
    token_hash: str = Field(max_length=64, unique=True, index=True)
    expira_en: datetime
    revocado: bool = Field(
        default=False,
        sa_column=sa.Column(
            sa.Boolean,
            nullable=False,
            server_default=sa.text("false"),
        ),
    )
    creado_en: datetime = Field(default_factory=datetime.utcnow)
