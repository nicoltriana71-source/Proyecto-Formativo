from typing import Optional, List
from sqlmodel import Session, select

from backend.app.modelos.control_fatiga import ControlFatiga
from backend.app.esquemas.control_fatiga import (
    ControlFatigaCrear,
    ControlFatigaActualizar
)


def listar_registros_fatiga(sesion: Session) -> List[ControlFatiga]:
    statement = select(ControlFatiga)
    return sesion.exec(statement).all()


def obtener_registro_fatiga(
    sesion: Session,
    id_fatiga: int
) -> Optional[ControlFatiga]:
    return sesion.get(ControlFatiga, id_fatiga)


def obtener_estado_fatiga_usuario(
    sesion: Session,
    id_usuario: int
) -> List[ControlFatiga]:
    statement = select(ControlFatiga).where(
        ControlFatiga.id_usuario == id_usuario
    )
    return sesion.exec(statement).all()


def registrar_nivel_fatiga(
    sesion: Session,
    datos: ControlFatigaCrear
) -> ControlFatiga:
    nuevo_registro = ControlFatiga(
        id_usuario=datos.id_usuario,
        id_plan=datos.id_plan,
        nivel_fatiga=datos.nivel_fatiga,
        observacion=datos.observacion
    )

    sesion.add(nuevo_registro)
    sesion.commit()
    sesion.refresh(nuevo_registro)

    return nuevo_registro


def actualizar_registro_fatiga(
    sesion: Session,
    id_fatiga: int,
    datos: ControlFatigaActualizar
) -> Optional[ControlFatiga]:

    fatiga_db = sesion.get(ControlFatiga, id_fatiga)

    if not fatiga_db:
        return None

    datos_dict = datos.model_dump(exclude_unset=True)

    for key, value in datos_dict.items():
        setattr(fatiga_db, key, value)

    sesion.add(fatiga_db)
    sesion.commit()
    sesion.refresh(fatiga_db)

    return fatiga_db


def eliminar_registro_fatiga(
    sesion: Session,
    id_fatiga: int
) -> Optional[ControlFatiga]:

    fatiga_db = sesion.get(ControlFatiga, id_fatiga)

    if not fatiga_db:
        return None

    sesion.delete(fatiga_db)
    sesion.commit()

    return fatiga_db