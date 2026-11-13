from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from base_datos import obtener_sesion

from backend.app.esquemas.asignatura import (
    AsignaturaCrear,
    AsignaturaActualizar,
    AsignaturaRespuesta
)

from backend.app.services.asignatura import (
    listar_asignaturas,
    crear_asignatura,
    obtener_asignatura,
    actualizar_asignatura,
    eliminar_asignatura
)


router = APIRouter(prefix="/asignatura", tags=["Asignaturas"])


@router.get("/", response_model=list[AsignaturaRespuesta])
def listar(sesion: Session = Depends(obtener_sesion)):
    return listar_asignaturas(sesion)


@router.post(
    "/",
    response_model=AsignaturaRespuesta,
    status_code=status.HTTP_201_CREATED
)
def crear(
    datos: AsignaturaCrear,
    sesion: Session = Depends(obtener_sesion)
):
    return crear_asignatura(datos, sesion)


@router.get("/{id_asignatura}", response_model=AsignaturaRespuesta)
def obtener(
    id_asignatura: int,
    sesion: Session = Depends(obtener_sesion)
):
    return obtener_asignatura(id_asignatura, sesion)


@router.put("/{id_asignatura}", response_model=AsignaturaRespuesta)
def actualizar(
    id_asignatura: int,
    datos: AsignaturaActualizar,
    sesion: Session = Depends(obtener_sesion)
):
    return actualizar_asignatura(id_asignatura, datos, sesion)


@router.delete("/{id_asignatura}", status_code=status.HTTP_200_OK)
def eliminar(
    id_asignatura: int,
    sesion: Session = Depends(obtener_sesion)
):
    return eliminar_asignatura(id_asignatura, sesion)