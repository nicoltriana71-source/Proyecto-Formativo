from typing import List

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from base_datos import obtener_sesion

from backend.app.esquemas.plan_estudio import (
    GenerarPlanSolicitud,
    PlanAjustarSchema,
    PlanCrear,
    PlanActualizar,
    PlanRespuesta
)

from backend.app.services.plan_estudio import (
    generar_y_crear_plan,
    listar_todos_los_planes,
    obtener_planes_usuario,
    obtener_detalle_plan,
    crear_plan,
    actualizar_plan,
    ajustar_plan,
    eliminar_plan
)


router = APIRouter(
    prefix="/plan-estudio",
    tags=["Planes de Estudio"]
)


@router.post("/generar", status_code=status.HTTP_201_CREATED)
def generar(
    solicitud: GenerarPlanSolicitud,
    sesion: Session = Depends(obtener_sesion)
):
    return generar_y_crear_plan(solicitud, sesion)


@router.get("/", response_model=List[PlanRespuesta])
def listar(sesion: Session = Depends(obtener_sesion)):
    return listar_todos_los_planes(sesion)


@router.get("/usuario/{id_usuario}", response_model=List[PlanRespuesta])
def listar_por_usuario(
    id_usuario: int,
    sesion: Session = Depends(obtener_sesion)
):
    return obtener_planes_usuario(id_usuario, sesion)


@router.get("/{id_plan}")
def obtener_detalle(
    id_plan: int,
    sesion: Session = Depends(obtener_sesion)
):
    return obtener_detalle_plan(id_plan, sesion)


@router.post(
    "/",
    response_model=PlanRespuesta,
    status_code=status.HTTP_201_CREATED
)
def crear(
    datos: PlanCrear,
    sesion: Session = Depends(obtener_sesion)
):
    return crear_plan(datos, sesion)


@router.put("/{id_plan}", response_model=PlanRespuesta)
def actualizar(
    id_plan: int,
    datos: PlanActualizar,
    sesion: Session = Depends(obtener_sesion)
):
    return actualizar_plan(id_plan, datos, sesion)


@router.put("/{id_plan}/ajustar")
def ajustar(
    id_plan: int,
    datos: PlanAjustarSchema,
    sesion: Session = Depends(obtener_sesion)
):
    return ajustar_plan(id_plan, datos, sesion)


@router.delete("/{id_plan}", status_code=status.HTTP_200_OK)
def eliminar(
    id_plan: int,
    sesion: Session = Depends(obtener_sesion)
):
    return eliminar_plan(id_plan, sesion)