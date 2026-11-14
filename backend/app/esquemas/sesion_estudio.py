from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class SesionEstudioCrear(BaseModel):
    id_usuario: int
    id_plan: int
    id_modulo: int
    id_tema: int
    fecha: Optional[datetime] = None
    duracion_minutos: Optional[int] = None
    completada: bool = False


class SesionEstudioActualizar(BaseModel):
    id_usuario: Optional[int] = None
    id_plan: Optional[int] = None
    id_modulo: Optional[int] = None
    id_tema: Optional[int] = None
    fecha: Optional[datetime] = None
    duracion_minutos: Optional[int] = None
    completada: Optional[bool] = None


class SesionEstudioRespuesta(BaseModel):
    id_sesion: int
    id_usuario: int
    id_plan: int
    id_modulo: int
    id_tema: int
    fecha: datetime
    duracion_minutos: Optional[int] = None
    completada: bool

    model_config = ConfigDict(from_attributes=True)