from typing import Optional
from pydantic import BaseModel, ConfigDict


class TemaRespuesta(BaseModel):
    id_tema: int
    id_modulo: int
    nombre: str
    descripcion: Optional[str] = None
    numero_tema: int
    duracion_estimada: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)