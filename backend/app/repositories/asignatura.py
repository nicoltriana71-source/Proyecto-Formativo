from typing import Optional, List
from sqlmodel import Session, select

from backend.app.modelos.asignatura import Asignatura
from backend.app.esquemas.asignatura import AsignaturaCrear, AsignaturaActualizar


def listar_asignaturas(sesion: Session) -> List[Asignatura]:
    statement = select(Asignatura)
    return sesion.exec(statement).all()


def crear_asignatura(sesion: Session, datos: AsignaturaCrear) -> Asignatura:
    nueva_asignatura = Asignatura(
        nombre=datos.nombre,
        descripcion=datos.descripcion,
        nivel_dificultad=datos.nivel_dificultad
    )

    sesion.add(nueva_asignatura)
    sesion.commit()
    sesion.refresh(nueva_asignatura)

    return nueva_asignatura


def obtener_asignatura(sesion: Session, id_asignatura: int) -> Optional[Asignatura]:
    return sesion.get(Asignatura, id_asignatura)


def actualizar_asignatura(
    sesion: Session,
    id_asignatura: int,
    datos: AsignaturaActualizar
) -> Optional[Asignatura]:

    asignatura_db = sesion.get(Asignatura, id_asignatura)

    if not asignatura_db:
        return None

    datos_dict = datos.model_dump(exclude_unset=True)

    for key, value in datos_dict.items():
        setattr(asignatura_db, key, value)

    sesion.add(asignatura_db)
    sesion.commit()
    sesion.refresh(asignatura_db)

    return asignatura_db


def eliminar_asignatura(sesion: Session, id_asignatura: int):
    asignatura_db = sesion.get(Asignatura, id_asignatura)

    if not asignatura_db:
        return None

    sesion.delete(asignatura_db)
    sesion.commit()

    return asignatura_db