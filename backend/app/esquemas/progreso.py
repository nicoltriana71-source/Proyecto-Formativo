from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ProgresoCrear(BaseModel):
    id_usuario: int
    id_plan: int
    id_modulo: int
    id_tema: int
    porcentaje: float = 0.0
    completado: bool = False


class ProgresoActualizar(BaseModel):
    id_usuario: Optional[int] = None
    id_plan: Optional[int] = None
    id_modulo: Optional[int] = None
    id_tema: Optional[int] = None
    porcentaje: Optional[float] = None
    completado: Optional[bool] = None
    fecha_inicio: Optional[datetime] = None
    fecha_ultima_actividad: Optional[datetime] = None


class ProgresoRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_progreso: int
    id_usuario: int
    id_plan: int
    id_modulo: int
    id_tema: int
    porcentaje: float
    completado: bool
    fecha_inicio: datetime
    fecha_ultima_actividad: datetime