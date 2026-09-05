from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class PromptIA(SQLModel, table=True):
    __tablename__ = "prompt_ia"

    id_prompt: Optional[int] = Field(default=None, primary_key=True)
    id_usuario: int = Field(foreign_key="usuario.id_usuario")
    id_plan: Optional[int] = Field(default=None, foreign_key="plan_de_estudio.id_plan")
    prompt_usuario: str
    prompt_sistema: Optional[str] = None
    modelo_ia: Optional[str] = Field(default="gpt-4o-mini")
    embedding: Optional[str] = Field(default=None)
    fecha_generacion: datetime = Field(default_factory=datetime.now)
    estado: Optional[str] = Field(default="completado")