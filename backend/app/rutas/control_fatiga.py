from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from base_datos import obtener_sesion

from backend.app.dependencias.auth import obtener_usuario_actual, verificar_propietario
from backend.app.esquemas.control_fatiga import (
    ControlFatigaActualizar,
    ControlFatigaCrear,
    ControlFatigaRespuesta,
)
from backend.app.modelos.usuario import Usuario
from backend.app.services.control_fatiga import (
    actualizar_registro_fatiga,
    eliminar_registro_fatiga,
    listar_registros_fatiga,
    obtener_estado_fatiga_usuario,
    obtener_registro_fatiga,
    registrar_nivel_fatiga,
)


router = APIRouter(prefix="/control-fatiga", tags=["Control de Fatiga"])


@router.get("/", response_model=list[ControlFatigaRespuesta])
def listar(
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    return [
        registro
        for registro in listar_registros_fatiga(sesion)
        if registro.id_usuario == usuario_actual.id_usuario
    ]


@router.get("/usuario/{id_usuario}", response_model=list[ControlFatigaRespuesta])
def obtener_por_usuario(
    id_usuario: int,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    verificar_propietario(id_usuario, usuario_actual, "usuario")
    return obtener_estado_fatiga_usuario(id_usuario, sesion)


@router.get("/{id_fatiga}", response_model=ControlFatigaRespuesta)
def obtener(
    id_fatiga: int,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    registro = obtener_registro_fatiga(id_fatiga, sesion)
    verificar_propietario(registro.id_usuario, usuario_actual, "registro de fatiga")
    return registro


@router.post(
    "/",
    response_model=ControlFatigaRespuesta,
    status_code=status.HTTP_201_CREATED,
)
def registrar(
    datos: ControlFatigaCrear,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    datos.id_usuario = usuario_actual.id_usuario
    return registrar_nivel_fatiga(datos, sesion)


@router.put("/{id_fatiga}", response_model=ControlFatigaRespuesta)
def actualizar(
    id_fatiga: int,
    datos: ControlFatigaActualizar,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    registro = obtener_registro_fatiga(id_fatiga, sesion)
    verificar_propietario(registro.id_usuario, usuario_actual, "registro de fatiga")
    return actualizar_registro_fatiga(id_fatiga, datos, sesion)


@router.delete("/{id_fatiga}", status_code=status.HTTP_200_OK)
def eliminar(
    id_fatiga: int,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    registro = obtener_registro_fatiga(id_fatiga, sesion)
    verificar_propietario(registro.id_usuario, usuario_actual, "registro de fatiga")
    return eliminar_registro_fatiga(id_fatiga, sesion)
