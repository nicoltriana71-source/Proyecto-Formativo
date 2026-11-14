
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UsuarioCrear(BaseModel):
    nombre: str
    correo: EmailStr
    contraseña: str
    acepto_terminos: Optional[bool] = False
    version_politica: Optional[str] = None


class UsuarioLogin(BaseModel):
    correo: EmailStr
    contraseña: str


class UsuarioGoogle(BaseModel):
    nombre: str
    correo: EmailStr


class UsuarioActualizar(BaseModel):
    nombre: Optional[str] = None
    correo: Optional[EmailStr] = None
    version_politica: Optional[str] = None


class UsuarioRespuesta(BaseModel):
    id_usuario: int
    nombre: str
    correo: EmailStr
    acepto_terminos: bool
    version_politica: Optional[str] = None
    fecha_aceptacion: Optional[datetime] = None

    class Config:
        from_attributes = True
