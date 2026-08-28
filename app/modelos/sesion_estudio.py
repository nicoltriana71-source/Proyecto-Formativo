from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class SesionEstudio(SQLModel, table=True):
    __tablename__ = "sesion_estudio"

    id_sesion: Optional[int] = Field(default=None, primary_key=True)
    id_usuario: int = Field(foreign_key="usuario.id_usuario")
    id_plan: int = Field(foreign_key="plan_de_estudio.id_plan")
    id_modulo: int = Field(foreign_key="modulo.id_modulo")
    id_tema: int = Field(foreign_key="tema.id_tema")
    fecha: datetime = Field(default_factory=datetime.now)
    duracion_minutos: Optional[int] = None
    completada: bool = Field(default=False) 