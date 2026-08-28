from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class ControlFatiga(SQLModel, table=True):
    __tablename__ = "control_fatiga"

    id_fatiga: Optional[int] = Field(default=None, primary_key=True)
    id_usuario: int = Field(foreign_key="usuario.id_usuario")
    id_plan: int = Field(foreign_key="plan_de_estudio.id_plan")
    nivel_fatiga: Optional[int] = None
    fecha_registro: datetime = Field(default_factory=datetime.now)
    observacion: Optional[str] = None