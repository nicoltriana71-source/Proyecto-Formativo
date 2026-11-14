
from typing import Optional, List
from sqlmodel import Session, select

from backend.app.modelos.plan_estudio import PlanDeEstudio
from backend.app.modelos.asignatura import Asignatura
from backend.app.modelos.usuario import Usuario
from backend.app.modelos.modulo import Modulo
from backend.app.modelos.tema import Tema

from backend.app.esquemas.plan_estudio import (
    PlanCrear,
    PlanActualizar
)


def listar_todos_los_planes(sesion: Session) -> List[PlanDeEstudio]:
    return sesion.exec(select(PlanDeEstudio)).all()


def obtener_planes_usuario(
    sesion: Session,
    id_usuario: int
) -> List[PlanDeEstudio]:

    statement = (
        select(PlanDeEstudio)
        .where(PlanDeEstudio.id_usuario == id_usuario)
        .order_by(PlanDeEstudio.id_plan.desc())
    )

    return sesion.exec(statement).all()


def obtener_plan(sesion: Session, id_plan: int) -> Optional[PlanDeEstudio]:
    return sesion.get(PlanDeEstudio, id_plan)


def obtener_asignatura_existente(sesion: Session):
    return sesion.exec(select(Asignatura)).first()


def crear_asignatura_general(sesion: Session, nivel_objetivo: str):
    nueva_asignatura = Asignatura(
        nombre="General",
        descripcion="Asignatura general creada automáticamente",
        nivel_dificultad=nivel_objetivo
    )

    sesion.add(nueva_asignatura)
    sesion.commit()
    sesion.refresh(nueva_asignatura)

    return nueva_asignatura


def obtener_usuario_existente(
    sesion: Session,
    id_usuario: int
):
    return sesion.get(Usuario, id_usuario)


def crear_plan_generado(
    sesion: Session,
    id_usuario: int,
    id_asignatura: int,
    id_ruta: Optional[int],
    titulo: str,
    descripcion: Optional[str],
    nivel_objetivo: Optional[str],
    duracion: Optional[int],
    contenido_json
):
    nuevo_plan = PlanDeEstudio(
        id_usuario=id_usuario,
        id_asignatura=id_asignatura,
        id_ruta=id_ruta,
        titulo=titulo,
        descripcion=descripcion,
        nivel_objetivo=nivel_objetivo,
        duracion=duracion,
        estado="activo",
        contenido_json=contenido_json
    )

    sesion.add(nuevo_plan)
    sesion.commit()
    sesion.refresh(nuevo_plan)

    return nuevo_plan


def obtener_estructura_plan(sesion: Session, id_plan: int):
    modulos = sesion.exec(
        select(Modulo).where(Modulo.id_plan == id_plan)
    ).all()

    estructura = []

    for modulo in modulos:
        temas = sesion.exec(
            select(Tema).where(Tema.id_modulo == modulo.id_modulo)
        ).all()

        estructura.append({
            "modulo": modulo,
            "temas": temas
        })

    return estructura


def crear_plan(sesion: Session, datos: PlanCrear) -> PlanDeEstudio:
    nuevo_plan = PlanDeEstudio(**datos.model_dump())

    sesion.add(nuevo_plan)
    sesion.commit()
    sesion.refresh(nuevo_plan)

    return nuevo_plan


def actualizar_plan(
    sesion: Session,
    id_plan: int,
    datos: PlanActualizar
) -> Optional[PlanDeEstudio]:

    plan_db = sesion.get(PlanDeEstudio, id_plan)

    if not plan_db:
        return None

    datos_dict = datos.model_dump(exclude_unset=True)

    for key, value in datos_dict.items():
        setattr(plan_db, key, value)

    sesion.add(plan_db)
    sesion.commit()
    sesion.refresh(plan_db)

    return plan_db


def guardar_contenido_ajustado(
    sesion: Session,
    plan_db: PlanDeEstudio,
    nuevo_contenido
):
    plan_db.contenido_json = nuevo_contenido

    sesion.add(plan_db)
    sesion.commit()
    sesion.refresh(plan_db)

    return plan_db


def eliminar_plan(sesion: Session, id_plan: int):
    plan_db = sesion.get(PlanDeEstudio, id_plan)

    if not plan_db:
        return None

    sesion.delete(plan_db)
    sesion.commit()

    return plan_db
