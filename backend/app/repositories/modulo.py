from typing import Optional, List
from sqlmodel import Session, select

from backend.app.modelos.modulo import Modulo
from backend.app.esquemas.modulo import ModuloCrear, ModuloActualizar


def listar_todos_los_modulos(sesion: Session) -> List[Modulo]:
    statement = select(Modulo)
    return sesion.exec(statement).all()


def obtener_modulo(sesion: Session, id_modulo: int) -> Optional[Modulo]:
    return sesion.get(Modulo, id_modulo)


def listar_modulos_por_plan(sesion: Session, id_plan: int) -> List[Modulo]:
    statement = select(Modulo).where(Modulo.id_plan == id_plan)
    return sesion.exec(statement).all()


def crear_modulo(sesion: Session, datos: ModuloCrear) -> Modulo:
    nuevo_modulo = Modulo(
        id_plan=datos.id_plan,
        nombre=datos.nombre,
        descripcion=datos.descripcion,
        numero_modulo=datos.numero_modulo,
        objetivo=datos.objetivo,
        estado=datos.estado
    )

    sesion.add(nuevo_modulo)
    sesion.commit()
    sesion.refresh(nuevo_modulo)

    return nuevo_modulo


def actualizar_modulo(
    sesion: Session,
    id_modulo: int,
    datos: ModuloActualizar
) -> Optional[Modulo]:

    modulo_db = sesion.get(Modulo, id_modulo)

    if not modulo_db:
        return None

    datos_dict = datos.model_dump(exclude_unset=True)

    for key, value in datos_dict.items():
        setattr(modulo_db, key, value)

    sesion.add(modulo_db)
    sesion.commit()
    sesion.refresh(modulo_db)

    return modulo_db


def eliminar_modulo(sesion: Session, id_modulo: int) -> Optional[Modulo]:
    modulo_db = sesion.get(Modulo, id_modulo)

    if not modulo_db:
        return None

    sesion.delete(modulo_db)
    sesion.commit()

    return modulo_db