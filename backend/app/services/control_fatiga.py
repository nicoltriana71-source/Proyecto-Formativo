from fastapi import HTTPException
from sqlmodel import Session

from backend.app.esquemas.control_fatiga import (
    ControlFatigaCrear,
    ControlFatigaActualizar
)

from backend.app.repositories.control_fatiga import (
    listar_registros_fatiga as repo_listar_registros_fatiga,
    obtener_registro_fatiga as repo_obtener_registro_fatiga,
    obtener_estado_fatiga_usuario as repo_obtener_estado_fatiga_usuario,
    registrar_nivel_fatiga as repo_registrar_nivel_fatiga,
    actualizar_registro_fatiga as repo_actualizar_registro_fatiga,
    eliminar_registro_fatiga as repo_eliminar_registro_fatiga
)


def listar_registros_fatiga(sesion: Session):
    return repo_listar_registros_fatiga(sesion)


def obtener_registro_fatiga(id_fatiga: int, sesion: Session):
    registro = repo_obtener_registro_fatiga(sesion, id_fatiga)

    if not registro:
        raise HTTPException(
            status_code=404,
            detail="Registro de fatiga no encontrado."
        )

    return registro


def obtener_estado_fatiga_usuario(id_usuario: int, sesion: Session):
    return repo_obtener_estado_fatiga_usuario(sesion, id_usuario)


def registrar_nivel_fatiga(datos: ControlFatigaCrear, sesion: Session):
    return repo_registrar_nivel_fatiga(sesion, datos)


def actualizar_registro_fatiga(
    id_fatiga: int,
    datos: ControlFatigaActualizar,
    sesion: Session
):
    registro = repo_actualizar_registro_fatiga(
        sesion, id_fatiga, datos
    )

    if not registro:
        raise HTTPException(
            status_code=404,
            detail="Registro de fatiga no encontrado."
        )

    return registro


def eliminar_registro_fatiga(id_fatiga: int, sesion: Session):
    registro = repo_eliminar_registro_fatiga(sesion, id_fatiga)

    if not registro:
        raise HTTPException(
            status_code=404,
            detail="Registro de fatiga no encontrado."
        )

    return {
        "mensaje": f"Registro de fatiga con ID {id_fatiga} eliminado correctamente."
    }