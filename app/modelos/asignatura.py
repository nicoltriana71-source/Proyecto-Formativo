from typing import Optional, List, TYPE_CHECKING
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modelos.horario import Horario
    from app.modelos.plan_de_estudio import PlanDeEstudio


class NivelDificultad(str, Enum):
    BASICO = "BASICO"
    INTERMEDIO = "INTERMEDIO"
    AVANZADO = "AVANZADO"


class Asignatura(SQLModel, table=True):
    __tablename__ = "asignatura"

    id_asignatura: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100)
    descripcion: Optional[str] = None
    nivel_dificultad: NivelDificultad = Field(default=NivelDificultad.BASICO)

    horarios: List["Horario"] = Relationship(back_populates="asignatura")
    planes: List["PlanDeEstudio"] = Relationship(back_populates="asignatura")
