from typing import Optional, List
from sqlmodel import Session, select

from backend.app.modelos.prompt_ia import PromptIA
from backend.app.modelos.plan_estudio import PlanDeEstudio
from backend.app.modelos.asignatura import Asignatura
from backend.app.modelos.usuario import Usuario
from backend.app.esquemas.prompt_ia import PromptActualizar

def obtener_usuario_existente(sesion: Session, id_usuario: int):
    return sesion.get(Usuario, id_usuario)

def obtener_primer_plan_usuario(sesion: Session, id_usuario: int):
    statement = (
        select(PlanDeEstudio)
        .where(PlanDeEstudio.id_usuario == id_usuario)
        .order_by(PlanDeEstudio.id_plan.asc())
    )

    return sesion.exec(statement).first()

def obtener_asignatura_existente(sesion: Session):
    return sesion.exec(select(Asignatura)).first()

def crear_asignatura_general(sesion: Session):
    nueva_asignatura = Asignatura(
        nombre="General",
        descripcion="Asignatura general creada automáticamente",
        nivel_dificultad="Intermedio"
    )

    sesion.add(nueva_asignatura)
    sesion.commit()
    sesion.refresh(nueva_asignatura)

    return nueva_asignatura

def crear_plan_generado(
    sesion: Session,
    id_usuario: int,
    id_asignatura: int,
    titulo: str,
    descripcion: str,
    duracion: int,
    contenido_json
):
    nuevo_plan = PlanDeEstudio(
        id_usuario=id_usuario,
        id_asignatura=id_asignatura,
        titulo=titulo,
        descripcion=descripcion,
        nivel_objetivo="Intermedio",
        duracion=duracion,
        estado="activo",
        contenido_json=contenido_json
    )

    sesion.add(nuevo_plan)
    sesion.commit()
    sesion.refresh(nuevo_plan)

    return nuevo_plan

def crear_registro_prompt(
    sesion: Session,
    id_usuario: int,
    id_plan: Optional[int],
    mensaje: str,
    respuesta: str
):
    nuevo_prompt = PromptIA(
        id_usuario=id_usuario,
        id_plan=id_plan,
        prompt_usuario=mensaje,
        prompt_sistema=respuesta,
        modelo_ia="gemini-3.5-flash-lite",
        estado="completado"
    )

    sesion.add(nuevo_prompt)
    sesion.commit()
    sesion.refresh(nuevo_prompt)

    return nuevo_prompt

def obtener_historial_usuario(
    sesion: Session,
    id_usuario: int
) -> List[PromptIA]:

    statement = (
        select(PromptIA)
        .where(
            (PromptIA.id_usuario == id_usuario) |
            (
                PromptIA.id_plan.in_(
                    select(PlanDeEstudio.id_plan).where(
                        PlanDeEstudio.id_usuario == id_usuario
                    )
                )
            )
        )
        .order_by(PromptIA.id_prompt.desc())
    )

    return sesion.exec(statement).all()

def obtener_historial_plan(
    sesion: Session,
    id_plan: int
) -> List[PromptIA]:

    statement = (
        select(PromptIA)
        .where(PromptIA.id_plan == id_plan)
        .order_by(PromptIA.id_prompt.desc())
    )

    return sesion.exec(statement).all()

def obtener_prompt(sesion: Session, id_prompt: int) -> Optional[PromptIA]:
    return sesion.get(PromptIA, id_prompt)

def actualizar_prompt(
    sesion: Session,
    prompt_db: PromptIA,
    datos: PromptActualizar
):
    datos_dict = datos.model_dump(exclude_unset=True)

    for key, value in datos_dict.items():
        setattr(prompt_db, key, value)

    sesion.add(prompt_db)
    sesion.commit()
    sesion.refresh(prompt_db)

    return prompt_db

def eliminar_prompt(sesion: Session, prompt_db: PromptIA):
    sesion.delete(prompt_db)
    sesion.commit()

    return prompt_db

def obtener_plan_usuario(
    sesion: Session,
    id_plan: int,
    id_usuario: int
):
    statement = select(PlanDeEstudio).where(
        PlanDeEstudio.id_plan == id_plan,
        PlanDeEstudio.id_usuario == id_usuario
    )

    return sesion.exec(statement).first()