from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from base_datos import obtener_sesion

from backend.app.esquemas.modulo import (
    ModuloCrear,
    ModuloActualizar,
    ModuloRespuesta
)

from backend.app.services.modulo import (
    listar_todos_los_modulos,
    obtener_modulo,
    listar_modulos_por_plan,
    crear_modulo,
    actualizar_modulo,
    eliminar_modulo
)


router = APIRouter(prefix="/modulo", tags=["Módulos"])


@router.get("/", response_model=list[ModuloRespuesta])
def listar(sesion: Session = Depends(obtener_sesion)):
    return listar_todos_los_modulos(sesion)


@router.get("/plan/{id_plan}", response_model=list[ModuloRespuesta])
def listar_por_plan(
    id_plan: int,
    sesion: Session = Depends(obtener_sesion)
):
    return listar_modulos_por_plan(id_plan, sesion)


@router.get("/{id_modulo}", response_model=ModuloRespuesta)
def obtener(
    id_modulo: int,
    sesion: Session = Depends(obtener_sesion)
):
    return obtener_modulo(id_modulo, sesion)


@router.post(
    "/",
    response_model=ModuloRespuesta,
    status_code=status.HTTP_201_CREATED
)
def crear(
    datos: ModuloCrear,
    sesion: Session = Depends(obtener_sesion)
):
    return crear_modulo(datos, sesion)


@router.put("/{id_modulo}", response_model=ModuloRespuesta)
def actualizar(
    id_modulo: int,
    datos: ModuloActualizar,
    sesion: Session = Depends(obtener_sesion)
):
    return actualizar_modulo(id_modulo, datos, sesion)


@router.delete("/{id_modulo}", status_code=status.HTTP_200_OK)
def eliminar(
    id_modulo: int,
    sesion: Session = Depends(obtener_sesion)
):
    return eliminar_modulo(id_modulo, sesion)