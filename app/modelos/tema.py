from typing import Optional
from sqlmodel import SQLModel, Field

class Tema(SQLModel, table=True):
    __tablename__ = "tema"

    id_tema: Optional[int] = Field(default=None, primary_key=True)
    id_modulo: int = Field(foreign_key="modulo.id_modulo")
    nombre: str = Field(max_length=150)
    descripcion: Optional[str] = None
    numero_tema: int
    duracion_estimada: Optional[int] = None