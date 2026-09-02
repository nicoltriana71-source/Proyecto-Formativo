from typing import Optional, TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modelos.usuario import Usuario


class ChatIA(SQLModel, table=True):
    __tablename__ = "chat_ia"

    id_chat: Optional[int] = Field(default=None, primary_key=True)
    id_usuario: int = Field(foreign_key="usuario.id_usuario")
    pregunta: str
    respuesta: str
    fecha: datetime

    usuario: Optional["Usuario"] = Relationship(back_populates="chats")