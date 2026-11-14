
import json

from sqlmodel import Session, select

from backend.app.modelos.usuario import Usuario
from backend.app.modelos.asignatura import Asignatura
from backend.app.modelos.plan_estudio import PlanDeEstudio
from backend.app.modelos.modulo import Modulo
from backend.app.modelos.tema import Tema
from backend.app.modelos.prompt_ia import PromptIA


def obtener_usuario(sesion: Session, id_usuario: int):
    return sesion.get(Usuario, id_usuario)


def obtener_plan_por_id(sesion: Session, id_plan: int):
    return sesion.get(PlanDeEstudio, id_plan)


def obtener_todos_los_planes(sesion: Session):
    return sesion.exec(
        select(PlanDeEstudio).where(
            PlanDeEstudio.contenido_json != None
        )
    ).all()


def obtener_asignaturas(sesion: Session):
    return sesion.exec(select(Asignatura)).all()


def obtener_plan_por_asignatura(sesion: Session, id_asignatura: int):
    return sesion.exec(
        select(PlanDeEstudio)
        .where(PlanDeEstudio.id_asignatura == id_asignatura)
        .where(PlanDeEstudio.contenido_json != None)
    ).first()


def obtener_prompts_con_embedding(sesion: Session):
    return sesion.exec(
        select(PromptIA)
        .where(PromptIA.id_plan != None)
        .where(PromptIA.embedding != None)
    ).all()


def obtener_o_crear_asignatura(sesion: Session, nombre_materia: str):
    asignatura = sesion.exec(
        select(Asignatura).where(
            Asignatura.nombre == nombre_materia
        )
    ).first()

    if asignatura:
        return asignatura

    asignatura = Asignatura(
        nombre=nombre_materia,
        descripcion=f"Asignatura de {nombre_materia} generada por IA",
        nivel_dificultad="Personalizado"
    )

    sesion.add(asignatura)
    sesion.commit()
    sesion.refresh(asignatura)

    return asignatura


def crear_plan(sesion: Session, datos_plan: dict, usuario_id: int):
    asignatura = obtener_o_crear_asignatura(
        sesion,
        datos_plan["materia"]
    )

    nuevo_plan = PlanDeEstudio(
        id_usuario=usuario_id,
        id_asignatura=asignatura.id_asignatura,
        titulo=datos_plan["titulo"],
        descripcion=datos_plan["descripcion"],
        estado="activo",
        contenido_json=datos_plan
    )

    sesion.add(nuevo_plan)
    sesion.commit()
    sesion.refresh(nuevo_plan)

    return nuevo_plan


def crear_modulo(
    sesion: Session,
    id_plan: int,
    datos_modulo: dict,
    numero_modulo: int
):
    nuevo_modulo = Modulo(
        id_plan=id_plan,
        nombre=str(datos_modulo.get("titulo") or f"Módulo {numero_modulo}"),
        descripcion=str(datos_modulo.get("teoria_modulo") or ""),
        numero_modulo=numero_modulo,
        objetivo=str(datos_modulo.get("nivel_tag") or "Objetivo del módulo"),
        estado="activo"
    )

    sesion.add(nuevo_modulo)
    sesion.commit()
    sesion.refresh(nuevo_modulo)

    return nuevo_modulo


def crear_tema(
    sesion: Session,
    id_modulo: int,
    datos_tema: dict,
    numero_tema: int
):
    nuevo_tema = Tema(
        id_modulo=id_modulo,
        nombre=str(datos_tema.get("titulo") or f"Lección {numero_tema}"),
        descripcion=str(datos_tema.get("concepto_teorico") or ""),
        numero_tema=numero_tema,
        duracion_estimada=int(datos_tema.get("duracion_minutos") or 45)
    )

    sesion.add(nuevo_tema)
    sesion.commit()
    sesion.refresh(nuevo_tema)

    return nuevo_tema


def actualizar_contenido_plan(
    sesion: Session,
    plan: PlanDeEstudio,
    contenido: dict
):
    plan.contenido_json = contenido
    sesion.add(plan)
    sesion.commit()
    sesion.refresh(plan)


def crear_registro_prompt(
    sesion: Session,
    usuario_id: int,
    id_plan: int,
    prompt_usuario: str,
    prompt_sistema: str,
    modelo_ia: str,
    embedding: str = None
):
    registro = PromptIA(
        id_usuario=usuario_id,
        id_plan=id_plan,
        prompt_usuario=prompt_usuario,
        prompt_sistema=prompt_sistema,
        modelo_ia=modelo_ia,
        embedding=embedding,
        estado="completado"
    )

    sesion.add(registro)
    sesion.commit()

    return registro


def clonar_plan(
    sesion: Session,
    plan_origen: PlanDeEstudio,
    usuario_id: int,
    contenido_plan
):
    nuevo_plan = PlanDeEstudio(
        id_usuario=usuario_id,
        id_asignatura=plan_origen.id_asignatura,
        titulo=plan_origen.titulo,
        descripcion=plan_origen.descripcion,
        nivel_objetivo=plan_origen.nivel_objetivo,
        duracion=plan_origen.duracion,
        estado="activo",
        contenido_json=contenido_plan
    )

    sesion.add(nuevo_plan)
    sesion.commit()
    sesion.refresh(nuevo_plan)

    return nuevo_plan
