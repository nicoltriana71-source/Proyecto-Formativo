from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from base_datos import obtener_sesion

from backend.app.esquemas.progreso import (
    ProgresoCrear,
    ProgresoActualizar,
    ProgresoRespuesta
)

from backend.app.services.progreso import (
    listar_todos_los_progresos,
    obtener_progreso,
    obtener_progreso_plan,
    crear_o_actualizar_progreso,
    actualizar_progreso,
    eliminar_progreso
)


router = APIRouter(
    prefix="/progreso",
    tags=["Progreso del Estudiante"]
)


@router.get("/", response_model=list[ProgresoRespuesta])
def listar_progresos(sesion: Session = Depends(obtener_sesion)):
    return listar_todos_los_progresos(sesion)


@router.get("/{id_progreso}", response_model=ProgresoRespuesta)
def consultar_progreso(
    id_progreso: int,
    sesion: Session = Depends(obtener_sesion)
):
    return obtener_progreso(id_progreso, sesion)


@router.get("/plan/{id_plan}/usuario/{id_usuario}")
def consultar_progreso_plan(
    id_plan: int,
    id_usuario: int,
    sesion: Session = Depends(obtener_sesion)
):
    return obtener_progreso_plan(
        id_plan,
        id_usuario,
        sesion
    )


@router.post(
    "/",
    response_model=ProgresoRespuesta,
    status_code=status.HTTP_201_CREATED
)
def registrar_progreso(
    datos: ProgresoCrear,
    sesion: Session = Depends(obtener_sesion)
):
    return crear_o_actualizar_progreso(datos, sesion)


@router.put("/{id_progreso}", response_model=ProgresoRespuesta)
def modificar_progreso(
    id_progreso: int,
    datos_progreso: ProgresoActualizar,
    sesion: Session = Depends(obtener_sesion)
):
    return actualizar_progreso(
        id_progreso,
        datos_progreso,
        sesion
    )


@router.delete("/{id_progreso}", status_code=status.HTTP_200_OK)
def borrar_progreso(
    id_progreso: int,
    sesion: Session = Depends(obtener_sesion)
):
    return eliminar_progreso(id_progreso, sesion)