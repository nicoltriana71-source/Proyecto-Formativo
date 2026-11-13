from pydantic import BaseModel
from typing import Optional


class AsignaturaCrear(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    nivel_dificultad: Optional[str] = "BASICO"


class AsignaturaActualizar(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    nivel_dificultad: Optional[str] = None


class AsignaturaRespuesta(BaseModel):
    id_asignatura: int
    nombre: str
    descripcion: Optional[str] = None
    nivel_dificultad: Optional[str] = "BASICO"

    class Config:
        from_attributes = True