from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from base_datos import obtener_sesion

from backend.app.esquemas.control_fatiga import (
    ControlFatigaCrear,
    ControlFatigaActualizar,
    ControlFatigaRespuesta
)

from backend.app.services.control_fatiga import (
    listar_registros_fatiga,
    obtener_registro_fatiga,
    obtener_estado_fatiga_usuario,
    registrar_nivel_fatiga,
    actualizar_registro_fatiga,
    eliminar_registro_fatiga
)


router = APIRouter(
    prefix="/control-fatiga",
    tags=["Control de Fatiga"]
)


@router.get("/", response_model=list[ControlFatigaRespuesta])
def listar(sesion: Session = Depends(obtener_sesion)):
    return listar_registros_fatiga(sesion)


@router.get("/usuario/{id_usuario}", response_model=list[ControlFatigaRespuesta])
def obtener_por_usuario(
    id_usuario: int,
    sesion: Session = Depends(obtener_sesion)
):
    return obtener_estado_fatiga_usuario(id_usuario, sesion)


@router.get("/{id_fatiga}", response_model=ControlFatigaRespuesta)
def obtener(
    id_fatiga: int,
    sesion: Session = Depends(obtener_sesion)
):
    return obtener_registro_fatiga(id_fatiga, sesion)


@router.post(
    "/",
    response_model=ControlFatigaRespuesta,
    status_code=status.HTTP_201_CREATED
)
def registrar(
    datos: ControlFatigaCrear,
    sesion: Session = Depends(obtener_sesion)
):
    return registrar_nivel_fatiga(datos, sesion)


@router.put("/{id_fatiga}", response_model=ControlFatigaRespuesta)
def actualizar(
    id_fatiga: int,
    datos: ControlFatigaActualizar,
    sesion: Session = Depends(obtener_sesion)
):
    return actualizar_registro_fatiga(id_fatiga, datos, sesion)


@router.delete("/{id_fatiga}", status_code=status.HTTP_200_OK)
def eliminar(
    id_fatiga: int,
    sesion: Session = Depends(obtener_sesion)
):
    return eliminar_registro_fatiga(id_fatiga, sesion)