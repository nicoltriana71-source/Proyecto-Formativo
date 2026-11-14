from fastapi import APIRouter, Depends, status
from sqlmodel import Session
from base_datos import obtener_sesion

from backend.app.esquemas.sesion_estudio import (
    SesionEstudioCrear,
    SesionEstudioActualizar,
    SesionEstudioRespuesta
)

from backend.app.services import sesion_estudio as servicio


router = APIRouter(
    prefix="/sesion-estudio",
    tags=["Sesiones de Estudio"]
)


@router.get("/", response_model=list[SesionEstudioRespuesta])
def listar_todas_las_sesiones(
    sesion: Session = Depends(obtener_sesion)
):
    return servicio.listar_todas_las_sesiones(sesion)


@router.get("/usuario/{id_usuario}", response_model=list[SesionEstudioRespuesta])
def listar_sesiones_usuario(
    id_usuario: int,
    sesion: Session = Depends(obtener_sesion)
):
    return servicio.listar_sesiones_usuario(sesion, id_usuario)


@router.get("/{id_sesion}", response_model=SesionEstudioRespuesta)
def obtener_sesion_por_id(
    id_sesion: int,
    sesion: Session = Depends(obtener_sesion)
):
    return servicio.obtener_sesion_por_id(sesion, id_sesion)


@router.post(
    "/",
    response_model=SesionEstudioRespuesta,
    status_code=status.HTTP_201_CREATED
)
def registrar_sesion(
    datos: SesionEstudioCrear,
    sesion: Session = Depends(obtener_sesion)
):
    datos_dict = datos.model_dump(exclude_unset=True)
    return servicio.registrar_sesion(sesion, datos_dict)


@router.put("/{id_sesion}", response_model=SesionEstudioRespuesta)
def actualizar_sesion(
    id_sesion: int,
    datos_sesion: SesionEstudioActualizar,
    sesion: Session = Depends(obtener_sesion)
):
    datos_dict = datos_sesion.model_dump(exclude_unset=True)

    return servicio.actualizar_sesion(
        sesion,
        id_sesion,
        datos_dict
    )


@router.delete("/{id_sesion}", status_code=status.HTTP_200_OK)
def eliminar_sesion(
    id_sesion: int,
    sesion: Session = Depends(obtener_sesion)
):
    return servicio.eliminar_sesion(sesion, id_sesion)