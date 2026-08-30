from typing import Optional, TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modelos.usuario import Usuario


class SesionDeEstudio(SQLModel, table=True):
    __tablename__ = "sesion_de_estudio"

    id_sesion: Optional[int] = Field(default=None, primary_key=True)
    id_usuario: int = Field(foreign_key="usuario.id_usuario")
    fecha: datetime
    tiempo_limite: int
    tiempo_utilizado: int
    fatiga_detectada: bool

    usuario: Optional["Usuario"] = Relationship(back_populates="sesiones")