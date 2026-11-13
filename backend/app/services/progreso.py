from fastapi import HTTPException, status
from sqlmodel import Session

from backend.app.esquemas.progreso import (
    ProgresoCrear,
    ProgresoActualizar
)

from backend.app.repositories.progreso import (
    listar_todos_los_progresos as repo_listar_progresos,
    obtener_progreso as repo_obtener_progreso,
    obtener_progreso_plan as repo_obtener_progreso_plan,
    buscar_progreso_existente,
    crear_progreso as repo_crear_progreso,
    actualizar_progreso_existente,
    modificar_progreso,
    eliminar_progreso as repo_eliminar_progreso
)


def listar_todos_los_progresos(sesion: Session):
    return repo_listar_progresos(sesion)


def obtener_progreso(id_progreso: int, sesion: Session):
    progreso = repo_obtener_progreso(sesion, id_progreso)

    if not progreso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de progreso no encontrado."
        )

    return progreso


def obtener_progreso_plan(
    id_plan: int,
    id_usuario: int,
    sesion: Session
):
    registros = repo_obtener_progreso_plan(
        sesion,
        id_plan,
        id_usuario
    )

    temas_completados = sum(
        1 for registro in registros if registro.completado
    )

    temas_totales = len(registros)

    porcentaje = (
        temas_completados / temas_totales * 100
        if temas_totales > 0 else 0.0
    )

    return {
        "id_plan": id_plan,
        "id_usuario": id_usuario,
        "porcentaje_avance": round(porcentaje, 2),
        "temas_completados": temas_completados,
        "temas_totales": temas_totales,
        "registros": registros
    }


def crear_o_actualizar_progreso(
    datos: ProgresoCrear,
    sesion: Session
):
    existente = buscar_progreso_existente(sesion, datos)

    if existente:
        return actualizar_progreso_existente(
            sesion,
            existente,
            datos
        )

    return repo_crear_progreso(sesion, datos)


def actualizar_progreso(
    id_progreso: int,
    datos: ProgresoActualizar,
    sesion: Session
):
    progreso = obtener_progreso(id_progreso, sesion)

    return modificar_progreso(
        sesion,
        progreso,
        datos
    )


def eliminar_progreso(id_progreso: int, sesion: Session):
    progreso = obtener_progreso(id_progreso, sesion)

    repo_eliminar_progreso(sesion, progreso)

    return {
        "mensaje": (
            f"Registro de progreso con ID {id_progreso} "
            "eliminado correctamente."
        )
    }