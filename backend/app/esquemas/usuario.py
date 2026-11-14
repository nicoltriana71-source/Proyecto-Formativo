from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UsuarioCrear(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    correo: EmailStr
    contraseña: str = Field(min_length=8, max_length=72)
    acepto_terminos: Optional[bool] = False
    version_politica: Optional[str] = None


class UsuarioLogin(BaseModel):
    correo: EmailStr
    contraseña: str


class UsuarioGoogle(BaseModel):
    """Solo se acepta el access token de Google; el backend lo verifica."""

    access_token: str


class UsuarioActualizar(BaseModel):
    nombre: Optional[str] = Field(default=None, min_length=2, max_length=100)
    correo: Optional[EmailStr] = None
    version_politica: Optional[str] = None


class RefreshSolicitud(BaseModel):
    refresh_token: str


class TokenRespuesta(BaseModel):
    """Respuesta de login/registro/refresh.

    Mantiene los campos planos que ya consume `saveSession()` en el frontend.
    """

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    id_usuario: int
    nombre: str
    correo: EmailStr
    rol: str = "ESTUDIANTE"


class UsuarioRespuesta(BaseModel):
    id_usuario: int
    nombre: str
    correo: EmailStr
    acepto_terminos: bool
    version_politica: Optional[str] = None
    fecha_aceptacion: Optional[datetime] = None

    class Config:
        from_attributes = True
