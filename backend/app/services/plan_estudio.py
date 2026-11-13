
import os
import json

from dotenv import load_dotenv
from google import genai

from fastapi import HTTPException, status
from sqlmodel import Session

from backend.app.esquemas.plan_estudio import (
    GenerarPlanSolicitud,
    PlanAjustarSchema,
    PlanCrear,
    PlanActualizar
)

from backend.app.repositories.plan_estudio import (
    listar_todos_los_planes as repo_listar_todos_los_planes,
    obtener_planes_usuario as repo_obtener_planes_usuario,
    obtener_plan as repo_obtener_plan,
    obtener_asignatura_existente,
    crear_asignatura_general,
    obtener_usuario_existente,
    crear_plan_generado,
    obtener_estructura_plan,
    crear_plan as repo_crear_plan,
    actualizar_plan as repo_actualizar_plan,
    guardar_contenido_ajustado,
    eliminar_plan as repo_eliminar_plan
)


# Cargar variables de entorno
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None


def generar_y_crear_plan(solicitud: GenerarPlanSolicitud, sesion: Session):
    """Genera un plan con Gemini y lo guarda en la base de datos."""

    if not GEMINI_API_KEY or not client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GEMINI_API_KEY no configurada en el archivo .env"
        )

    prompt = f"""
    Crea un plan de estudio estructurado sobre el tema: "{solicitud.titulo}".
    - Nivel: {solicitud.nivel_objetivo}
    - Duración: {solicitud.duracion} días
    - Detalles adicionales: {solicitud.descripcion or 'Ninguno'}

    Responde EXCLUSIVAMENTE con un JSON válido sin formato markdown ni texto adicional:
    {{
      "resumen": "Descripción general",
      "modulos": [
        {{
          "dia": 1,
          "tema": "Título del módulo o tema",
          "detalles": "Detalle de actividades",
          "recursos": ["Recurso 1", "Recurso 2"]
        }}
      ]
    }}
    """

    try:
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt
        )

        texto_limpio = (
            response.text.replace("```json", "")
            .replace("```", "")
            .strip()
        )

        contenido_json = json.loads(texto_limpio)

    except Exception as e:
        contenido_json = {
            "resumen": (
                response.text
                if 'response' in locals() and hasattr(response, 'text')
                else "Plan genérico"
            ),
            "modulos": []
        }

    # Resolver id_asignatura si viene nulo
    id_asig = solicitud.id_asignatura

    if not id_asig:
        asig_existente = obtener_asignatura_existente(sesion)

        if asig_existente:
            id_asig = asig_existente.id_asignatura
        else:
            nueva_asig = crear_asignatura_general(
                sesion,
                solicitud.nivel_objetivo or "Intermedio"
            )
            id_asig = nueva_asig.id_asignatura

    # Resolver y validar id_usuario
    user_db = obtener_usuario_existente(sesion, solicitud.id_usuario)

    if not user_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El usuario indicado no existe."
        )

    id_user_valido = user_db.id_usuario

    return crear_plan_generado(
        sesion=sesion,
        id_usuario=id_user_valido,
        id_asignatura=id_asig,
        id_ruta=solicitud.id_ruta,
        titulo=solicitud.titulo,
        descripcion=solicitud.descripcion,
        nivel_objetivo=solicitud.nivel_objetivo,
        duracion=solicitud.duracion,
        contenido_json=contenido_json
    )


def listar_todos_los_planes(sesion: Session):
    return repo_listar_todos_los_planes(sesion)


def obtener_planes_usuario(id_usuario: int, sesion: Session):
    return repo_obtener_planes_usuario(sesion, id_usuario)


def obtener_detalle_plan(id_plan: int, sesion: Session):
    plan = repo_obtener_plan(sesion, id_plan)

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan de estudio no encontrado"
        )

    estructura = obtener_estructura_plan(sesion, id_plan)

    contenido = plan.contenido_json

    if isinstance(contenido, str):
        try:
            contenido = json.loads(contenido)
        except json.JSONDecodeError:
            pass

    return {
        "plan": plan,
        "contenido_relacional": estructura,
        "contenido_json": contenido
    }


def crear_plan(datos: PlanCrear, sesion: Session):
    return repo_crear_plan(sesion, datos)


def actualizar_plan(
    id_plan: int,
    datos: PlanActualizar,
    sesion: Session
):
    plan = repo_actualizar_plan(sesion, id_plan, datos)

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan de estudio no encontrado"
        )

    return plan


def ajustar_plan(
    id_plan: int,
    datos: PlanAjustarSchema,
    sesion: Session
):
    """Ajusta la estructura JSON de un plan utilizando Gemini."""

    if not GEMINI_API_KEY or not client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GEMINI_API_KEY no configurada en el archivo .env"
        )

    plan_db = repo_obtener_plan(sesion, id_plan)

    if not plan_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan de estudio no encontrado"
        )

    prompt = f"""
    Ajusta el siguiente plan de estudio en formato JSON según estas indicaciones: "{datos.indicaciones}".

    Plan actual:
    {json.dumps(plan_db.contenido_json, ensure_ascii=False)}

    Responde EXCLUSIVAMENTE con el objeto JSON ajustado y actualizado sin bloques markdown.
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        texto_limpio = (
            response.text.replace("```json", "")
            .replace("```", "")
            .strip()
        )

        nuevo_contenido = json.loads(texto_limpio)

        plan_db = guardar_contenido_ajustado(
            sesion,
            plan_db,
            nuevo_contenido
        )

        return {
            "mensaje": f"Plan {id_plan} reajustado exitosamente por la IA.",
            "plan": plan_db
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al reajustar el plan: {str(e)}"
        )


def eliminar_plan(id_plan: int, sesion: Session):
    plan = repo_eliminar_plan(sesion, id_plan)

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan de estudio no encontrado"
        )

    return {
        "mensaje": f"Plan de estudio con ID {id_plan} eliminado correctamente."
    }
