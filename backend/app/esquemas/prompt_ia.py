from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class ChatSolicitud(BaseModel):
    id_usuario: int
    id_plan: Optional[int] = None
    mensaje: str

class GenerarPlanSolicitud(BaseModel):
    id_usuario: int
    id_asignatura: int
    objetivo_estudio: str
    nivel_objetivo: str
    duracion_dias: int

class PromptActualizar(BaseModel):
    id_usuario: Optional[int] = None
    id_plan: Optional[int] = None
    prompt_usuario: Optional[str] = None
    prompt_sistema: Optional[str] = None
    modelo_ia: Optional[str] = None
    embedding: Optional[str] = None
    estado: Optional[str] = None

class PromptRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_prompt: int
    id_usuario: Optional[int] = None
    id_plan: Optional[int] = None
    prompt_usuario: Optional[str] = None
    prompt_sistema: Optional[str] = None
    modelo_ia: Optional[str] = None
    embedding: Optional[str] = None
    fecha_generacion: datetime
    estado: Optional[str] = None