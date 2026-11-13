import os
import json

from dotenv import load_dotenv
from google import genai

from fastapi import HTTPException, status
from sqlmodel import Session

from backend.app.esquemas.prompt_ia import ChatSolicitud

from backend.app.repositories.prompt_ia import (
    obtener_usuario_existente,
    obtener_asignatura_existente,
    crear_asignatura_general,
    crear_plan_generado,
    crear_registro_prompt,
    obtener_historial_usuario as repo_historial_usuario,
    obtener_historial_plan as repo_historial_plan,
    obtener_primer_plan_usuario,
    obtener_prompt as repo_obtener_prompt,
    actualizar_prompt as repo_actualizar_prompt,
    eliminar_prompt as repo_eliminar_prompt
)

# Cargar variables de entorno
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

def interactuar_ia(solicitud: ChatSolicitud, sesion: Session):
    """Procesa mensajes del usuario utilizando Gemini."""

    if not GEMINI_API_KEY or not client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="La API Key de Gemini no está configurada en las variables de entorno."
        )

    # Validar que el usuario exista
    user_db = obtener_usuario_existente(
        sesion,
        solicitud.id_usuario
    )

    if not user_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El usuario indicado no existe."
        )

    # Validar que el plan pertenezca al usuario, si se envió uno
    plan_id = solicitud.id_plan

    if plan_id is not None:
        from backend.app.repositories.prompt_ia import obtener_plan_usuario

        plan_db = obtener_plan_usuario(
            sesion,
            plan_id,
            solicitud.id_usuario
        )

        if not plan_db:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="El plan no existe o no pertenece al usuario indicado."
            )

    prompt_instrucciones = f"""
    Eres el asistente oficial de StudNova IA.
    Mensaje del usuario: "{solicitud.mensaje}"

    REGLAS DE RESPUESTA:
    1. Si el usuario te pide CREAR, GENERAR, HACER o ENSEÑAR un plan/curso/ruta de aprendizaje:
       Responde ÚNICAMENTE con este formato JSON válido:
       {{
         "tipo": "plan_generado",
         "titulo": "Plan de {solicitud.mensaje[:30]}",
         "resumen": "Ruta de aprendizaje personalizada generada por StudNova IA.",
         "modulos": [
           {{
             "dia": 1,
             "tema": "Introducción y Conceptos Clave",
             "detalles": "Fundamentos iniciales y práctica guiada.",
             "recursos": ["Documentación oficial", "Ejercicios prácticos"]
           }}
         ]
       }}

    2. Si es una pregunta conceptual, saludo o duda general:
       Responde de forma natural en texto claro como tutor educativo.
    """

    try:
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt_instrucciones
        )

        if not response.text:
            raise ValueError("Gemini no devolvió una respuesta.")

        respuesta_raw = (
            response.text
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        # CASO 1: Generación de plan de estudio
        if respuesta_raw.startswith("{"):
            try:
                datos_plan = json.loads(respuesta_raw)
            except json.JSONDecodeError:
                datos_plan = {}

            if datos_plan.get("tipo") == "plan_generado":

                asig_existente = obtener_asignatura_existente(sesion)

                if asig_existente:
                    id_asig = asig_existente.id_asignatura
                else:
                    nueva_asig = crear_asignatura_general(sesion)
                    id_asig = nueva_asig.id_asignatura

                nuevo_plan = crear_plan_generado(
                    sesion=sesion,
                    id_usuario=user_db.id_usuario,
                    id_asignatura=id_asig,
                    titulo=datos_plan.get(
                        "titulo",
                        f"Plan de {solicitud.mensaje[:30]}"
                    ),
                    descripcion=datos_plan.get(
                        "resumen",
                        "Plan generado con StudNova IA"
                    ),
                    duracion=len(datos_plan.get("modulos", [])),
                    contenido_json=datos_plan
                )

                registro_prompt = crear_registro_prompt(
                    sesion=sesion,
                    id_usuario=user_db.id_usuario,
                    id_plan=nuevo_plan.id_plan,
                    mensaje=solicitud.mensaje,
                    respuesta=(
                        f"Plan de estudio generado exitosamente "
                        f"con ID {nuevo_plan.id_plan}"
                    )
                )

                return {
                    "tipo": "plan_generado",
                    "respuesta": f"✨ ¡He generado tu plan: '{nuevo_plan.titulo}'!",
                    "plan": nuevo_plan,
                    "registro": registro_prompt
                }

        # CASO 2: Consulta conversacional o respuesta general
        if not plan_id:
            primer_plan = obtener_primer_plan_usuario(
                sesion,
                user_db.id_usuario
            )

            if primer_plan:
                plan_id = primer_plan.id_plan

        registro_prompt = crear_registro_prompt(
            sesion=sesion,
            id_usuario=user_db.id_usuario,
            id_plan=plan_id,
            mensaje=solicitud.mensaje,
            respuesta=respuesta_raw
        )

        return {
            "tipo": "texto",
            "respuesta": respuesta_raw,
            "registro": registro_prompt
        }

    except HTTPException:
        sesion.rollback()
        raise

    except Exception as e:
        sesion.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en el servicio de IA: {str(e)}"
        )

def obtener_historial_usuario(id_usuario: int, sesion: Session):
    usuario = obtener_usuario_existente(sesion, id_usuario)

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El usuario indicado no existe."
        )

    return repo_historial_usuario(sesion, id_usuario)

def obtener_historial_plan(id_plan: int, sesion: Session):
    return repo_historial_plan(sesion, id_plan)

def obtener_prompt_por_id(id_prompt: int, sesion: Session):
    prompt = repo_obtener_prompt(sesion, id_prompt)

    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de interacción no encontrado."
        )

    return prompt

def actualizar_prompt(
    id_prompt: int,
    datos_actualizar,
    sesion: Session
):
    prompt = obtener_prompt_por_id(id_prompt, sesion)

    return repo_actualizar_prompt(
        sesion,
        prompt,
        datos_actualizar
    )

def eliminar_prompt(id_prompt: int, sesion: Session):
    prompt = obtener_prompt_por_id(id_prompt, sesion)

    repo_eliminar_prompt(sesion, prompt)

    return {
        "mensaje": f"Registro de historial {id_prompt} eliminado correctamente."
    }