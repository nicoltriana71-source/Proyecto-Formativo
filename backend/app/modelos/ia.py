
from typing import Optional
from datetime import datetime

from sqlmodel import SQLModel, Field


class RegistroIA(SQLModel):
    """
    Modelo de datos para representar una interacción
    con el generador de planes de estudio de StudNova.
    """

    id_usuario: int
    prompt: str
    respuesta: Optional[str] = None
    modelo_ia: Optional[str] = "gemini"
    fecha_generacion: datetime = Field(
        default_factory=datetime.now
    )
    estado: Optional[str] = "completado"
