
from pydantic import BaseModel, Field
from typing import List, Optional


class MensajeHistorial(BaseModel):
    rol: str
    texto: str


class SolicitudGeneracion(BaseModel):
    prompt: str
    id_usuario: Optional[int] = None
    historial: List[MensajeHistorial] = Field(default_factory=list)
    forzar_nuevo: bool = False
    cantidad_modulos: Optional[int] = None
    duracion_personalizada: Optional[str] = None


class SolicitudAceptarPlan(BaseModel):
    id_plan: int
    id_usuario: Optional[int] = None
