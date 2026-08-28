from pydantic import BaseModel, EmailStr

class UsuarioCrear(BaseModel):
    nombre: str
    correo: EmailStr
    contraseña: str

class UsuarioLogin(BaseModel):
    correo: EmailStr
    contraseña: str

class UsuarioRespuesta(BaseModel):
    id_usuario: int
    nombre: str
    correo: str

    class Config:
        from_attributes = True