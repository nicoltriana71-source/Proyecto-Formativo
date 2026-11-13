from typing import Optional, List
from sqlmodel import Session, select

from backend.app.modelos.progreso import Progreso
from backend.app.esquemas.progreso import (
    ProgresoCrear,
    ProgresoActualizar
)


def listar_todos_los_progresos(sesion: Session) -> List[Progreso]:
    return sesion.exec(select(Progreso)).all()


def obtener_progreso(
    sesion: Session,
    id_progreso: int
) -> Optional[Progreso]:
    return sesion.get(Progreso, id_progreso)


def obtener_progreso_plan(
    sesion: Session,
    id_plan: int,
    id_usuario: int
) -> List[Progreso]:

    statement = select(Progreso).where(
        Progreso.id_plan == id_plan,
        Progreso.id_usuario == id_usuario
    )

    return sesion.exec(statement).all()


def buscar_progreso_existente(
    sesion: Session,
    datos: ProgresoCrear
) -> Optional[Progreso]:

    statement = select(Progreso).where(
        Progreso.id_usuario == datos.id_usuario,
        Progreso.id_plan == datos.id_plan,
        Progreso.id_modulo == datos.id_modulo,
        Progreso.id_tema == datos.id_tema
    )

    return sesion.exec(statement).first()


def crear_progreso(
    sesion: Session,
    datos: ProgresoCrear
) -> Progreso:

    nuevo_progreso = Progreso(**datos.model_dump())

    sesion.add(nuevo_progreso)
    sesion.commit()
    sesion.refresh(nuevo_progreso)

    return nuevo_progreso


def actualizar_progreso_existente(
    sesion: Session,
    progreso_db: Progreso,
    datos: ProgresoCrear
) -> Progreso:

    progreso_db.completado = datos.completado
    progreso_db.porcentaje = datos.porcentaje

    sesion.add(progreso_db)
    sesion.commit()
    sesion.refresh(progreso_db)

    return progreso_db


def modificar_progreso(
    sesion: Session,
    progreso_db: Progreso,
    datos: ProgresoActualizar
) -> Progreso:

    datos_dict = datos.model_dump(exclude_unset=True)

    for key, value in datos_dict.items():
        setattr(progreso_db, key, value)

    sesion.add(progreso_db)
    sesion.commit()
    sesion.refresh(progreso_db)

    return progreso_db


def eliminar_progreso(
    sesion: Session,
    progreso_db: Progreso
):
    sesion.delete(progreso_db)
    sesion.commit()

    return progreso_db