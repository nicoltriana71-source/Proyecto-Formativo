from typing import List

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from base_datos import obtener_sesion

from backend.app.dependencias.auth import obtener_usuario_actual, verificar_propietario
from backend.app.esquemas.usuario import (
    RefreshSolicitud,
    TokenRespuesta,
    UsuarioActualizar,
    UsuarioCrear,
    UsuarioGoogle,
    UsuarioLogin,
    UsuarioRespuesta,
)
from backend.app.modelos.usuario import Usuario
from backend.app.services.usuario import (
    actualizar_usuario,
    cerrar_sesion,
    eliminar_usuario,
    login,
    login_o_registro_google,
    obtener_usuario_por_id,
    obtener_usuarios,
    refrescar_sesion,
    registrar_usuario,
)


router = APIRouter(prefix="/usuario", tags=["Usuarios"])


# REGISTRO
@router.post(
    "/registro",
    response_model=TokenRespuesta,
    status_code=status.HTTP_201_CREATED,
)
def registro(datos: UsuarioCrear, sesion: Session = Depends(obtener_sesion)):
    return registrar_usuario(datos, sesion)


# LOGIN
@router.post("/login", response_model=TokenRespuesta)
def inicio_sesion(datos: UsuarioLogin, sesion: Session = Depends(obtener_sesion)):
    return login(datos, sesion)


# GOOGLE
@router.post("/google", response_model=TokenRespuesta)
async def google(datos: UsuarioGoogle, sesion: Session = Depends(obtener_sesion)):
    return await login_o_registro_google(datos, sesion)


# REFRESH
@router.post("/refresh", response_model=TokenRespuesta)
def refresh(datos: RefreshSolicitud, sesion: Session = Depends(obtener_sesion)):
    return refrescar_sesion(datos, sesion)


# LOGOUT
@router.post("/logout")
def logout(datos: RefreshSolicitud, sesion: Session = Depends(obtener_sesion)):
    return cerrar_sesion(datos, sesion)


# USUARIO AUTENTICADO
@router.get("/me", response_model=UsuarioRespuesta)
def yo(usuario_actual: Usuario = Depends(obtener_usuario_actual)):
    return usuario_actual


# CONSULTAR TODOS (requiere autenticación)
@router.get(
    "/",
    response_model=List[UsuarioRespuesta],
    dependencies=[Depends(obtener_usuario_actual)],
)
def listar_usuarios(sesion: Session = Depends(obtener_sesion)):
    return obtener_usuarios(sesion)


# CONSULTAR POR ID (solo el propio)
@router.get("/{id_usuario}", response_model=UsuarioRespuesta)
def consultar_usuario(
    id_usuario: int,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    verificar_propietario(id_usuario, usuario_actual, "usuario")
    return obtener_usuario_por_id(id_usuario, sesion)


# ACTUALIZAR (solo el propio)
@router.put("/{id_usuario}", response_model=UsuarioRespuesta)
def modificar_usuario(
    id_usuario: int,
    datos: UsuarioActualizar,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    verificar_propietario(id_usuario, usuario_actual, "usuario")
    return actualizar_usuario(id_usuario, datos, sesion)


# ELIMINAR (solo el propio)
@router.delete("/{id_usuario}")
def borrar_usuario(
    id_usuario: int,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    verificar_propietario(id_usuario, usuario_actual, "usuario")
    return eliminar_usuario(id_usuario, sesion)
