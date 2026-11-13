from typing import Optional, Any
from datetime import datetime
from pydantic import BaseModel


class GenerarPlanSolicitud(BaseModel):
    id_usuario: int
    titulo: str
    descripcion: Optional[str] = None
    nivel_objetivo: Optional[str] = "Intermedio"
    duracion: Optional[int] = 7
    id_asignatura: Optional[int] = None
    id_ruta: Optional[int] = None


class PlanAjustarSchema(BaseModel):
    indicaciones: str


class PlanCrear(BaseModel):
    id_usuario: int
    id_asignatura: int
    titulo: str
    descripcion: Optional[str] = None
    estado: Optional[str] = "activo"
    nivel_objetivo: Optional[str] = None
    duracion: Optional[int] = None
    id_ruta: Optional[int] = None
    contenido_json: Optional[Any] = None


class PlanActualizar(BaseModel):
    id_usuario: Optional[int] = None
    id_asignatura: Optional[int] = None
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[str] = None
    nivel_objetivo: Optional[str] = None
    duracion: Optional[int] = None
    id_ruta: Optional[int] = None
    contenido_json: Optional[Any] = None


class PlanRespuesta(BaseModel):
    id_plan: int
    id_usuario: int
    id_asignatura: int
    titulo: str
    descripcion: Optional[str] = None
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    estado: Optional[str] = None
    nivel_objetivo: Optional[str] = None
    duracion: Optional[int] = None
    id_ruta: Optional[int] = None
    contenido_json: Optional[Any] = None

    class Config:
        from_attributes = True