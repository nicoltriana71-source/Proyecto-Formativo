from fastapi import HTTPException
from sqlmodel import Session
from backend.app.repositories import sesion_estudio as repositorio


def listar_todas_las_sesiones(sesion: Session):
    return repositorio.listar_todas_las_sesiones(sesion)


def obtener_sesion_por_id(sesion: Session, id_sesion: int):
    sesion_db = repositorio.obtener_sesion_por_id(sesion, id_sesion)

    if not sesion_db:
        raise HTTPException(
            status_code=404,
            detail="Sesión de estudio no encontrada."
        )

    return sesion_db


def listar_sesiones_usuario(sesion: Session, id_usuario: int):
    return repositorio.listar_sesiones_usuario(sesion, id_usuario)


def registrar_sesion(sesion: Session, datos: dict):
    return repositorio.registrar_sesion(sesion, datos)


def actualizar_sesion(sesion: Session, id_sesion: int, datos: dict):
    sesion_db = obtener_sesion_por_id(sesion, id_sesion)

    return repositorio.actualizar_sesion(sesion, sesion_db, datos)


def eliminar_sesion(sesion: Session, id_sesion: int):
    sesion_db = obtener_sesion_por_id(sesion, id_sesion)

    repositorio.eliminar_sesion(sesion, sesion_db)

    return {
        "mensaje": f"Sesión de estudio con ID {id_sesion} eliminada correctamente."
    }