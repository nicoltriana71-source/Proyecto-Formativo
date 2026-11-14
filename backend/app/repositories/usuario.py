import secrets
from datetime import datetime
from typing import List, Optional

from sqlalchemy import func
from sqlmodel import Session, select

from backend.app.esquemas.usuario import UsuarioActualizar, UsuarioCrear
from backend.app.modelos.usuario import Usuario
from backend.app.utilidades.seguridad import hash_password, verify_password


def _normalizar_correo(correo: str) -> str:
    return str(correo).strip().lower()


def obtener_usuario_por_correo(sesion: Session, correo: str) -> Optional[Usuario]:
    # Comparación insensible a mayúsculas para no duplicar cuentas.
    declaracion = select(Usuario).where(
        func.lower(Usuario.correo) == _normalizar_correo(correo)
    )
    return sesion.exec(declaracion).first()


def crear_usuario(sesion: Session, datos: UsuarioCrear) -> Usuario:
    nuevo_usuario = Usuario(
        nombre=datos.nombre,
        correo=_normalizar_correo(datos.correo),
        contraseña=hash_password(datos.contraseña),
        acepto_terminos=datos.acepto_terminos or False,
        version_politica=datos.version_politica,
        fecha_aceptacion=datetime.utcnow() if datos.acepto_terminos else None,
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

    guardada = usuario.contraseña

    if guardada.startswith(("$2a$", "$2b$", "$2y$")):
        return usuario if verify_password(contraseña, guardada) else None

    # Migración transparente: contraseñas antiguas guardadas en texto plano.
    if not secrets.compare_digest(guardada, contraseña):
        return None

    usuario.contraseña = hash_password(contraseña)
    sesion.add(usuario)
    sesion.commit()
    sesion.refresh(usuario)
    return usuario


def crear_usuario_google(sesion: Session, nombre: str, correo: str) -> Usuario:
    nuevo_usuario = Usuario(
        nombre=nombre,
        correo=_normalizar_correo(correo),
        # Contraseña aleatoria: la cuenta solo entra por Google.
        contraseña=hash_password(secrets.token_urlsafe(32)),
        acepto_terminos=True,
        fecha_aceptacion=datetime.utcnow(),
    )

    try:
        sesion.add(nuevo_usuario)
        sesion.commit()
        sesion.refresh(nuevo_usuario)
        return nuevo_usuario
    except Exception:
        sesion.rollback()
        raise


def obtener_usuarios(sesion: Session) -> List[Usuario]:
    return list(sesion.exec(select(Usuario)).all())


def obtener_usuario_por_id(sesion: Session, id_usuario: int) -> Optional[Usuario]:
    return sesion.get(Usuario, id_usuario)


def actualizar_usuario(
    sesion: Session,
    id_usuario: int,
    datos: UsuarioActualizar,
) -> Optional[Usuario]:
    usuario = obtener_usuario_por_id(sesion, id_usuario)

    if not usuario:
        return None

    cambios = datos.model_dump(exclude_unset=True)

    if "correo" in cambios and cambios["correo"]:
        cambios["correo"] = _normalizar_correo(cambios["correo"])

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
