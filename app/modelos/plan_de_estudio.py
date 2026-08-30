from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modelos.usuario import Usuario
    from app.modelos.asignatura import Asignatura
    from app.modelos.ruta_de_aprendizaje import RutaDeAprendizaje
    from app.modelos.sugerencia import Sugerencia


class PlanDeEstudio(SQLModel, table=True):
    __tablename__ = "plan_de_estudio"

    id_plan: Optional[int] = Field(default=None, primary_key=True)
    id_usuario: int = Field(foreign_key="usuario.id_usuario")
    titulo: str = Field(max_length=200)
    fecha_creacion: datetime
    estado: bool
    nivel_objetivo: str = Field(max_length=100)
    id_asignatura: int = Field(foreign_key="asignatura.id_asignatura")
    id_ruta: int = Field(foreign_key="ruta_de_aprendizaje.id_ruta")

    usuario: Optional["Usuario"] = Relationship(back_populates="planes")
    asignatura: Optional["Asignatura"] = Relationship(back_populates="planes")
    ruta: Optional["RutaDeAprendizaje"] = Relationship(back_populates="planes")
    sugerencias: List["Sugerencia"] = Relationship(back_populates="plan")