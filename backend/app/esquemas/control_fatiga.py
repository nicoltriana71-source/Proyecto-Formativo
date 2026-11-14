from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ControlFatigaCrear(BaseModel):
    id_usuario: int
    id_plan: int
    nivel_fatiga: Optional[int] = None
    observacion: Optional[str] = None


class ControlFatigaActualizar(BaseModel):
    nivel_fatiga: Optional[int] = None
    observacion: Optional[str] = None


class ControlFatigaRespuesta(BaseModel):
    id_fatiga: int
    id_usuario: int
    id_plan: int
    nivel_fatiga: Optional[int] = None
    fecha_registro: datetime
    observacion: Optional[str] = None

    class Config:
        from_attributes = True