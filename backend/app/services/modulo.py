from fastapi import HTTPException
from sqlmodel import Session

from backend.app.esquemas.modulo import ModuloCrear, ModuloActualizar

from backend.app.repositories.modulo import (
    listar_todos_los_modulos as repo_listar_todos_los_modulos,
    obtener_modulo as repo_obtener_modulo,
    listar_modulos_por_plan as repo_listar_modulos_por_plan,
    crear_modulo as repo_crear_modulo,
    actualizar_modulo as repo_actualizar_modulo,
    eliminar_modulo as repo_eliminar_modulo
)


def listar_todos_los_modulos(sesion: Session):
    return repo_listar_todos_los_modulos(sesion)


def obtener_modulo(id_modulo: int, sesion: Session):
    modulo = repo_obtener_modulo(sesion, id_modulo)

    if not modulo:
        raise HTTPException(
            status_code=404,
            detail="Módulo no encontrado."
        )

    return modulo


def listar_modulos_por_plan(id_plan: int, sesion: Session):
    return repo_listar_modulos_por_plan(sesion, id_plan)


def crear_modulo(datos: ModuloCrear, sesion: Session):
    return repo_crear_modulo(sesion, datos)


def actualizar_modulo(
    id_modulo: int,
    datos: ModuloActualizar,
    sesion: Session
):
    modulo = repo_actualizar_modulo(sesion, id_modulo, datos)

    if not modulo:
        raise HTTPException(
            status_code=404,
            detail="Módulo no encontrado."
        )

    return modulo


def eliminar_modulo(id_modulo: int, sesion: Session):
    modulo = repo_eliminar_modulo(sesion, id_modulo)

    if not modulo:
        raise HTTPException(
            status_code=404,
            detail="Módulo no encontrado."
        )

    return {
        "mensaje": f"Módulo con ID {id_modulo} eliminado correctamente."
    }