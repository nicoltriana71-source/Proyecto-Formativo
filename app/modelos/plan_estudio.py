from typing import Optional, List, Any, TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Column, Relationship
from sqlalchemy.dialects.postgresql import JSONB

if TYPE_CHECKING:
    from app.modelos.usuario import Usuario
    from app.modelos.asignatura import Asignatura
    from app.modelos.ruta_de_aprendizaje import RutaDeAprendizaje
    from app.modelos.sugerencia import Sugerencia


class PlanDeEstudio(SQLModel, table=True):
    __tablename__ = "plan_de_estudio"

    id_plan: Optional[int] = Field(default=None, primary_key=True)
    id_usuario: int = Field(foreign_key="usuario.id_usuario")
    id_asignatura: Optional[int] = Field(default=None, foreign_key="asignatura.id_asignatura")
    id_ruta: Optional[int] = Field(default=None, foreign_key="ruta_de_aprendizaje.id_ruta")
    titulo: str = Field(max_length=200)
    descripcion: Optional[str] = None
    fecha_creacion: datetime = Field(default_factory=datetime.now)
    fecha_actualizacion: datetime = Field(default_factory=datetime.now)
    estado: Optional[str] = Field(default="activo")
    nivel_objetivo: Optional[str] = Field(default=None, max_length=100)
    duracion: Optional[int] = None
    contenido_json: Optional[Any] = Field(default=None, sa_column=Column(JSONB))

    usuario: Optional["Usuario"] = Relationship(back_populates="planes")
    asignatura: Optional["Asignatura"] = Relationship(back_populates="planes")
    ruta: Optional["RutaDeAprendizaje"] = Relationship(back_populates="planes")
    sugerencias: List["Sugerencia"] = Relationship(back_populates="plan")