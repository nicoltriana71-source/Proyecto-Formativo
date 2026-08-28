from typing import Optional
from sqlmodel import SQLModel, Field

class Asignatura(SQLModel, table=True):
    __tablename__ = "asignatura"

    id_asignatura: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100)
    descripcion: Optional[str] = None
    nivel_dificultad: Optional[str] = Field(default=None, max_length=50)