
from typing import Optional, List
from datetime import datetime

from sqlmodel import Session, select

from backend.app.modelos.usuario import Usuario
from backend.app.esquemas.usuario import UsuarioCrear, UsuarioGoogle, UsuarioActualizar


def obtener_usuario_por_correo(sesion: Session, correo: str) -> Optional[Usuario]:
    declaracion = select(Usuario).where(Usuario.correo == correo)
    return sesion.exec(declaracion).first()


def crear_usuario(sesion: Session, datos: UsuarioCrear) -> Usuario:
    nuevo_usuario = Usuario(
        nombre=datos.nombre,
        correo=datos.correo,
        contraseña=datos.contraseña,
        acepto_terminos=datos.acepto_terminos or False,
        version_politica=datos.version_politica,
        fecha_aceptacion=datetime.utcnow() if datos.acepto_terminos else None
    )

    try:
        sesion.add(nuevo_usuario)
        sesion.commit()
        sesion.refresh(nuevo_usuario)
        return nuevo_usuario
    except Exception:
        sesion.rollback()
        raise


def autenticar_usuario(sesion: Session, correo: str, contraseña: str) -> Optional[Usuario]:
    usuario = obtener_usuario_por_correo(sesion, correo)

    if not usuario:
        return None

    if usuario.contraseña != contraseña:
        return None

    return usuario


def crear_usuario_google(sesion: Session, datos: UsuarioGoogle) -> Usuario:
    nuevo_usuario = Usuario(
        nombre=datos.nombre,
        correo=datos.correo,
        contraseña=f"google_{datos.correo}",
        acepto_terminos=True,
        fecha_aceptacion=datetime.utcnow()
    )

    try:
        sesion.add(nuevo_usuario)
        sesion.commit()
        sesion.refresh(nuevo_usuario)
        return nuevo_usuario
    except Exception:
        sesion.rollback()
        raise


# CONSULTAR TODOS LOS USUARIOS
def obtener_usuarios(sesion: Session) -> List[Usuario]:
    declaracion = select(Usuario)
    return list(sesion.exec(declaracion).all())


# CONSULTAR USUARIO POR ID
def obtener_usuario_por_id(sesion: Session, id_usuario: int) -> Optional[Usuario]:
    return sesion.get(Usuario, id_usuario)


# ACTUALIZAR USUARIO
def actualizar_usuario(
    sesion: Session,
    id_usuario: int,
    datos: UsuarioActualizar
) -> Optional[Usuario]:

    usuario = obtener_usuario_por_id(sesion, id_usuario)

    if not usuario:
        return None

    cambios = datos.dict(exclude_unset=True)

    for campo, valor in cambios.items():
        setattr(usuario, campo, valor)

    try:
        sesion.add(usuario)
        sesion.commit()
        sesion.refresh(usuario)
        return usuario
    except Exception:
        sesion.rollback()
        raise


# ELIMINAR USUARIO
def eliminar_usuario(sesion: Session, id_usuario: int) -> bool:
    usuario = obtener_usuario_por_id(sesion, id_usuario)

    if not usuario:
        return False

    try:
        sesion.delete(usuario)
        sesion.commit()
        return True
    except Exception:
        sesion.rollback()
        raise
