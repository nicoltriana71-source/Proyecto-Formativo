from typing import Optional, TYPE_CHECKING
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modelos.plan_de_estudio import PlanDeEstudio


class TipoSugerencia(str, Enum):
    ACTIVIDAD = "ACTIVIDAD"
    EVALUACION = "EVALUACION"
    EJERCICIOS = "EJERCICIOS"


class Sugerencia(SQLModel, table=True):
    __tablename__ = "sugerencia"

    id_sugerencia: Optional[int] = Field(default=None, primary_key=True)
    id_plan: int = Field(foreign_key="plan_de_estudio.id_plan")
    titulo: str = Field(max_length=200)
    descripcion: str
    tipo: TipoSugerencia

    plan: Optional["PlanDeEstudio"] = Relationship(back_populates="sugerencias")