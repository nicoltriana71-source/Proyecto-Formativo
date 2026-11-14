from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from base_datos import obtener_sesion

from backend.app.dependencias.auth import obtener_usuario_actual, verificar_propietario
from backend.app.esquemas.progreso import (
    ProgresoActualizar,
    ProgresoCrear,
    ProgresoRespuesta,
)
from backend.app.modelos.usuario import Usuario
from backend.app.services.progreso import (
    actualizar_progreso,
    crear_o_actualizar_progreso,
    eliminar_progreso,
    listar_todos_los_progresos,
    obtener_progreso,
    obtener_progreso_plan,
)


router = APIRouter(prefix="/progreso", tags=["Progreso del Estudiante"])


@router.get("/", response_model=list[ProgresoRespuesta])
def listar_progresos(
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    return [
        registro
        for registro in listar_todos_los_progresos(sesion)
        if registro.id_usuario == usuario_actual.id_usuario
    ]


@router.get("/plan/{id_plan}/usuario/{id_usuario}")
def consultar_progreso_plan(
    id_plan: int,
    id_usuario: int,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    verificar_propietario(id_usuario, usuario_actual, "usuario")
    return obtener_progreso_plan(id_plan, id_usuario, sesion)


@router.get("/{id_progreso}", response_model=ProgresoRespuesta)
def consultar_progreso(
    id_progreso: int,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    progreso = obtener_progreso(id_progreso, sesion)
    verificar_propietario(progreso.id_usuario, usuario_actual, "registro de progreso")
    return progreso


@router.post(
    "/",
    response_model=ProgresoRespuesta,
    status_code=status.HTTP_201_CREATED,
)
def registrar_progreso(
    datos: ProgresoCrear,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    datos.id_usuario = usuario_actual.id_usuario
    return crear_o_actualizar_progreso(datos, sesion)


@router.put("/{id_progreso}", response_model=ProgresoRespuesta)
def modificar_progreso(
    id_progreso: int,
    datos_progreso: ProgresoActualizar,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    progreso = obtener_progreso(id_progreso, sesion)
    verificar_propietario(progreso.id_usuario, usuario_actual, "registro de progreso")
    datos_progreso.id_usuario = usuario_actual.id_usuario
    return actualizar_progreso(id_progreso, datos_progreso, sesion)


@router.delete("/{id_progreso}", status_code=status.HTTP_200_OK)
def borrar_progreso(
    id_progreso: int,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    progreso = obtener_progreso(id_progreso, sesion)
    verificar_propietario(progreso.id_usuario, usuario_actual, "registro de progreso")
    return eliminar_progreso(id_progreso, sesion)
