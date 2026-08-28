from typing import Optional
from sqlmodel import SQLModel, Field

class Usuario(SQLModel, table=True):
    __tablename__ = "usuario"

    id_usuario: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100)
    correo: str = Field(max_length=150, unique=True, index=True)
    contraseña: str = Field(max_length=255)