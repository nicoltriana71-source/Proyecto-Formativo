from typing import Optional, Any
from datetime import datetime
from sqlmodel import SQLModel, Field, Column
from sqlalchemy.dialects.postgresql import JSONB

class PlanDeEstudio(SQLModel, table=True):
    __tablename__ = "plan_de_estudio"

    id_plan: Optional[int] = Field(default=None, primary_key=True)
    id_usuario: int = Field(foreign_key="usuario.id_usuario")
    id_asignatura: int = Field(foreign_key="asignatura.id_asignatura")
    titulo: str = Field(max_length=150)
    descripcion: Optional[str] = None
    fecha_creacion: datetime = Field(default_factory=datetime.now)
    fecha_actualizacion: datetime = Field(default_factory=datetime.now)
    estado: Optional[str] = Field(default="activo")
    nivel_objetivo: Optional[str] = None
    duracion: Optional[int] = None
    contenido_json: Optional[Any] = Field(default=None, sa_column=Column(JSONB))