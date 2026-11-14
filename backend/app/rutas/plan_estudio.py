from typing import List

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from base_datos import obtener_sesion

from backend.app.dependencias.auth import obtener_usuario_actual, verificar_propietario
from backend.app.esquemas.plan_estudio import (
    GenerarPlanSolicitud,
    PlanActualizar,
    PlanAjustarSchema,
    PlanCrear,
    PlanRespuesta,
)
from backend.app.modelos.usuario import Usuario
from backend.app.services.plan_estudio import (
    actualizar_plan,
    ajustar_plan,
    crear_plan,
    eliminar_plan,
    generar_y_crear_plan,
    obtener_detalle_plan,
    obtener_planes_usuario,
)


router = APIRouter(prefix="/plan-estudio", tags=["Planes de Estudio"])


def _verificar_plan(id_plan: int, sesion: Session, usuario_actual: Usuario):
    detalle = obtener_detalle_plan(id_plan, sesion)
    verificar_propietario(detalle["plan"].id_usuario, usuario_actual, "plan de estudio")
    return detalle


@router.post("/generar", status_code=status.HTTP_201_CREATED)
def generar(
    solicitud: GenerarPlanSolicitud,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    # El dueño del plan siempre es el usuario del token.
    solicitud.id_usuario = usuario_actual.id_usuario
    return generar_y_crear_plan(solicitud, sesion)


@router.get("/", response_model=List[PlanRespuesta])
def listar(
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    return obtener_planes_usuario(usuario_actual.id_usuario, sesion)


@router.get("/usuario/{id_usuario}", response_model=List[PlanRespuesta])
def listar_por_usuario(
    id_usuario: int,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    verificar_propietario(id_usuario, usuario_actual, "usuario")
    return obtener_planes_usuario(id_usuario, sesion)


@router.get("/{id_plan}")
def obtener_detalle(
    id_plan: int,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    return _verificar_plan(id_plan, sesion, usuario_actual)


@router.post(
    "/",
    response_model=PlanRespuesta,
    status_code=status.HTTP_201_CREATED,
)
def crear(
    datos: PlanCrear,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    datos.id_usuario = usuario_actual.id_usuario
    return crear_plan(datos, sesion)


@router.put("/{id_plan}", response_model=PlanRespuesta)
def actualizar(
    id_plan: int,
    datos: PlanActualizar,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    _verificar_plan(id_plan, sesion, usuario_actual)
    datos.id_usuario = usuario_actual.id_usuario
    return actualizar_plan(id_plan, datos, sesion)


@router.put("/{id_plan}/ajustar")
def ajustar(
    id_plan: int,
    datos: PlanAjustarSchema,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    _verificar_plan(id_plan, sesion, usuario_actual)
    return ajustar_plan(id_plan, datos, sesion)


@router.delete("/{id_plan}", status_code=status.HTTP_200_OK)
def eliminar(
    id_plan: int,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    _verificar_plan(id_plan, sesion, usuario_actual)
    return eliminar_plan(id_plan, sesion)
