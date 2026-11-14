
from fastapi import Depends, HTTPException, status
from sqlmodel import Session

from base_datos import obtener_sesion

from backend.app.repositories.usuario import (
    crear_usuario,
    autenticar_usuario,
    obtener_usuario_por_correo,
    crear_usuario_google,
    obtener_usuarios as repo_obtener_usuarios,
    obtener_usuario_por_id as repo_obtener_usuario_por_id,
    actualizar_usuario as repo_actualizar_usuario,
    eliminar_usuario as repo_eliminar_usuario
)

from backend.app.esquemas.usuario import (
    UsuarioCrear,
    UsuarioLogin,
    UsuarioGoogle,
    UsuarioActualizar
)


def registrar_usuario(datos: UsuarioCrear, sesion: Session = Depends(obtener_sesion)):
    existente = obtener_usuario_por_correo(sesion, datos.correo)

    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo ya se encuentra registrado."
        )

    return crear_usuario(sesion, datos)


def login(datos: UsuarioLogin, sesion: Session = Depends(obtener_sesion)):
    usuario = autenticar_usuario(sesion, datos.correo, datos.contraseña)

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos."
        )

    return {
        "mensaje": "Inicio de sesión exitoso",
        "id_usuario": usuario.id_usuario,
        "nombre": usuario.nombre,
        "correo": usuario.correo,
        "rol": "ESTUDIANTE"
    }


def login_o_registro_google(datos: UsuarioGoogle, sesion: Session = Depends(obtener_sesion)):
    usuario = obtener_usuario_por_correo(sesion, datos.correo)

    if not usuario:
        usuario = crear_usuario_google(sesion, datos)

    return usuario


# CONSULTAR TODOS LOS USUARIOS
def obtener_usuarios(sesion: Session = Depends(obtener_sesion)):
    return repo_obtener_usuarios(sesion)


# CONSULTAR USUARIO POR ID
def obtener_usuario_por_id(
    id_usuario: int,
    sesion: Session = Depends(obtener_sesion)
):
    usuario = repo_obtener_usuario_por_id(sesion, id_usuario)

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado."
        )

    return usuario


# ACTUALIZAR USUARIO
def actualizar_usuario(
    id_usuario: int,
    datos: UsuarioActualizar,
    sesion: Session = Depends(obtener_sesion)
):
    usuario = repo_obtener_usuario_por_id(sesion, id_usuario)

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado."
        )

    cambios = datos.dict(exclude_unset=True)

    if "correo" in cambios:
        existente = obtener_usuario_por_correo(sesion, cambios["correo"])

        if existente and existente.id_usuario != id_usuario:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo ya está registrado por otro usuario."
            )

    return repo_actualizar_usuario(sesion, id_usuario, datos)


# ELIMINAR USUARIO
def eliminar_usuario(
    id_usuario: int,
    sesion: Session = Depends(obtener_sesion)
):
    eliminado = repo_eliminar_usuario(sesion, id_usuario)

    if not eliminado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado."
        )

    return {
        "mensaje": "Usuario eliminado correctamente."
    }
