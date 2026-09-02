from typing import Optional, List, TYPE_CHECKING
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modelos.plan_de_estudio import PlanDeEstudio


class NivelRuta(str, Enum):
    BASICO = "BASICO"
    INTERMEDIO = "INTERMEDIO"
    AVANZADO = "AVANZADO"


class RutaDeAprendizaje(SQLModel, table=True):
    __tablename__ = "ruta_de_aprendizaje"

    id_ruta: Optional[int] = Field(default=None, primary_key=True)
    nivel: NivelRuta
    tema: str = Field(max_length=200)
    descripcion: str
    orden: int

    planes: List["PlanDeEstudio"] = Relationship(back_populates="ruta")