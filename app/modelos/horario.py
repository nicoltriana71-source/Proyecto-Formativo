from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modelos.asignatura import Asignatura


class Horario(SQLModel, table=True):
    __tablename__ = "horario"

    id_horario: Optional[int] = Field(default=None, primary_key=True)
    id_asignatura: int = Field(foreign_key="asignatura.id_asignatura")
    dia_semana: int

    asignatura: Optional["Asignatura"] = Relationship(back_populates="horarios")