from fastapi import HTTPException
from sqlmodel import Session

from backend.app.esquemas.asignatura import AsignaturaCrear, AsignaturaActualizar
from backend.app.repositories.asignatura import (
    listar_asignaturas as repo_listar_asignaturas,
    crear_asignatura as repo_crear_asignatura,
    obtener_asignatura as repo_obtener_asignatura,
    actualizar_asignatura as repo_actualizar_asignatura,
    eliminar_asignatura as repo_eliminar_asignatura
)


def listar_asignaturas(sesion: Session):
    return repo_listar_asignaturas(sesion)


def crear_asignatura(datos: AsignaturaCrear, sesion: Session):
    return repo_crear_asignatura(sesion, datos)


def obtener_asignatura(id_asignatura: int, sesion: Session):
    asignatura = repo_obtener_asignatura(sesion, id_asignatura)

    if not asignatura:
        raise HTTPException(status_code=404, detail="Asignatura no encontrada.")

    return asignatura


def actualizar_asignatura(
    id_asignatura: int,
    datos: AsignaturaActualizar,
    sesion: Session
):
    asignatura = repo_actualizar_asignatura(sesion, id_asignatura, datos)

    if not asignatura:
        raise HTTPException(status_code=404, detail="Asignatura no encontrada.")

    return asignatura


def eliminar_asignatura(id_asignatura: int, sesion: Session):
    asignatura = repo_eliminar_asignatura(sesion, id_asignatura)

    if not asignatura:
        raise HTTPException(status_code=404, detail="Asignatura no encontrada.")

    return {
        "mensaje": f"Asignatura con ID {id_asignatura} eliminada correctamente."
    }