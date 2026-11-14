from pydantic import BaseModel
from typing import Optional


class ModuloCrear(BaseModel):
    id_plan: int
    nombre: str
    descripcion: Optional[str] = None
    numero_modulo: int
    objetivo: Optional[str] = None
    estado: Optional[str] = "activo"


class ModuloActualizar(BaseModel):
    id_plan: Optional[int] = None
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    numero_modulo: Optional[int] = None
    objetivo: Optional[str] = None
    estado: Optional[str] = None


class ModuloRespuesta(BaseModel):
    id_modulo: int
    id_plan: int
    nombre: str
    descripcion: Optional[str] = None
    numero_modulo: int
    objetivo: Optional[str] = None
    estado: Optional[str] = "activo"

    class Config:
        from_attributes = True