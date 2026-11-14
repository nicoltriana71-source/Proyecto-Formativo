import json
from typing import Optional
from fastapi import Depends, HTTPException, UploadFile, File, Form
from sqlmodel import Session

# Ajusta según la ubicación de tu conexión a base de datos
from base_datos import obtener_sesion

from backend.app.esquemas.ia import SolicitudGeneracion, SolicitudAceptarPlan
from backend.app.repositories import ia as repositorio
from backend.app.services.ia_cache import buscar_plan_en_cache
from backend.app.services.ia_almacenamiento import guardar_plan_generado_en_bd
from backend.app.services.ia_generacion import detectar_duracion, invocar_gemini_para_plan
from backend.app.services.ia_archivos import procesar_archivo_adjunto


def validar_usuario(sesion: Session, id_usuario: Optional[int]) -> int:
    if id_usuario is None:
        raise HTTPException(
            status_code=400,
            detail="El ID del usuario es obligatorio."
        )

    usuario = repositorio.obtener_usuario(sesion, id_usuario)
    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="El usuario no existe."
        )

    return usuario.id_usuario


def generar_plan(
    solicitud: SolicitudGeneracion,
    sesion: Session = Depends(obtener_sesion)
):
    usuario_id = validar_usuario(sesion, solicitud.id_usuario)

    if not solicitud.prompt.strip():
        raise HTTPException(
            status_code=400,
            detail="El prompt no puede estar vacío"
        )

    try:
        # 1. Buscar en caché si no forzó uno nuevo
        if not solicitud.forzar_nuevo:
            plan_existente = buscar_plan_en_cache(sesion, solicitud.prompt, usuario_id)
            if plan_existente and plan_existente.get("plan"):
                plan_obj = plan_existente["plan"]
                if isinstance(plan_obj, str):
                    try:
                        plan_obj = json.loads(plan_obj)
                    except Exception:
                        plan_obj = {"titulo": plan_obj}

                if not isinstance(plan_obj, dict):
                    plan_obj = {"titulo": str(plan_obj)}

                titulo = plan_obj.get("titulo") or "Plan de Estudio"
                return {
                    "tipo": "sugerencia_plan_existente",
                    "mensaje": f"💡 Ya existe en nuestra biblioteca un plan de estudio sobre **{titulo}**.",
                    "plan_sugerido": plan_obj,
                    "id_plan": plan_existente.get("id_plan"),
                    "prompt_original": solicitud.prompt,
                    "similitud": plan_existente.get("similitud", 1.0)
                }

        # 2. Detectar duración y preparar llamada a Gemini
        duracion_final = detectar_duracion(solicitud.prompt, solicitud.duracion_personalizada)
        historial = [m.model_dump() for m in (solicitud.historial or [])]

        resultado = invocar_gemini_para_plan(
            prompt=solicitud.prompt,
            historial=historial,
            cantidad_modulos=solicitud.cantidad_modulos,
            duracion_personalizada=duracion_final
        )

        tiene_plan = (
            resultado.get("tipo") == "plan_generado"
            or "plan" in resultado
            or "modulos" in resultado
        )

        if tiene_plan and (resultado.get("plan") or resultado.get("modulos")):
            if "plan" not in resultado:
                resultado = {
                    "tipo": "plan_generado",
                    "mensaje": "Plan generado con éxito",
                    "plan": resultado
                }

            resultado = guardar_plan_generado_en_bd(
                sesion,
                usuario_id,
                solicitud.prompt,
                resultado
            )

        return resultado

    except HTTPException:
        sesion.rollback()
        raise
    except Exception as e:
        sesion.rollback()
        raise HTTPException(status_code=500, detail=str(e))


def aceptar_plan_sugerido(
    solicitud: SolicitudAceptarPlan,
    sesion: Session = Depends(obtener_sesion)
):
    usuario_id = validar_usuario(sesion, solicitud.id_usuario)

    try:
        plan_origen = repositorio.obtener_plan_por_id(sesion, solicitud.id_plan)
        if not plan_origen or not plan_origen.contenido_json:
            raise HTTPException(
                status_code=404,
                detail="Plan de estudio no encontrado"
            )

        contenido_plan = plan_origen.contenido_json
        if isinstance(contenido_plan, str):
            try:
                contenido_plan = json.loads(contenido_plan)
            except Exception:
                pass

        if plan_origen.id_usuario == usuario_id:
            return {
                "tipo": "plan_generado",
                "mensaje": f"⚡ ¡Cargando tu plan existente: '{plan_origen.titulo}'!",
                "plan": contenido_plan,
                "id_plan": plan_origen.id_plan,
                "id_usuario": usuario_id,
                "desde_cache": True
            }

        nuevo_plan = repositorio.clonar_plan(sesion, plan_origen, usuario_id, contenido_plan)

        if isinstance(contenido_plan, dict):
            contenido_plan = contenido_plan.copy()
            contenido_plan["id_plan"] = nuevo_plan.id_plan
            repositorio.actualizar_contenido_plan(sesion, nuevo_plan, contenido_plan)

        repositorio.crear_registro_prompt(
            sesion=sesion,
            usuario_id=usuario_id,
            id_plan=nuevo_plan.id_plan,
            prompt_usuario=f"Adoptó plan sugerido: {nuevo_plan.titulo}",
            prompt_sistema=f"Plan adoptado de ID {plan_origen.id_plan}",
            modelo_ia="cache/plan-existente"
        )

        return {
            "tipo": "plan_generado",
            "mensaje": f"✨ ¡Has agregado a tu biblioteca el plan: '{nuevo_plan.titulo}'!",
            "plan": contenido_plan,
            "id_plan": nuevo_plan.id_plan,
            "id_usuario": usuario_id,
            "desde_cache": True
        }

    except HTTPException:
        sesion.rollback()
        raise
    except Exception as e:
        sesion.rollback()
        raise HTTPException(status_code=500, detail=str(e))


async def generar_plan_con_archivo(
    prompt: str = Form("Genera un plan de estudio a partir de este documento."),
    id_usuario: Optional[int] = Form(None),
    cantidad_modulos: Optional[int] = Form(None),
    duracion_personalizada: Optional[str] = Form(None),
    historial_json: Optional[str] = Form(None),
    archivo: Optional[UploadFile] = File(None),
    forzar_nuevo: bool = Form(False),
    sesion: Session = Depends(obtener_sesion)
):
    usuario_id = validar_usuario(sesion, id_usuario)

    try:
        texto_extraido, nombre_doc = await procesar_archivo_adjunto(archivo)

        # Consultar caché si no hay archivo adjunto
        if not texto_extraido and not nombre_doc and not forzar_nuevo:
            plan_existente = buscar_plan_en_cache(sesion, prompt, usuario_id)
            if plan_existente and plan_existente.get("plan"):
                plan_obj = plan_existente["plan"]
                if isinstance(plan_obj, str):
                    try:
                        plan_obj = json.loads(plan_obj)
                    except Exception:
                        plan_obj = {"titulo": plan_obj}

                if not isinstance(plan_obj, dict):
                    plan_obj = {"titulo": str(plan_obj)}

                titulo = plan_obj.get("titulo") or "Plan de Estudio"
                return {
                    "tipo": "sugerencia_plan_existente",
                    "mensaje": f"💡 Ya existe en nuestra biblioteca un plan de estudio sobre **{titulo}**.",
                    "plan_sugerido": plan_obj,
                    "id_plan": plan_existente.get("id_plan"),
                    "prompt_original": prompt,
                    "similitud": plan_existente.get("similitud", 1.0)
                }

        historial = []
        if historial_json:
            try:
                historial = json.loads(historial_json)
                if not isinstance(historial, list):
                    historial = []
            except Exception:
                historial = []

        prompt_final = prompt
        if nombre_doc and not texto_extraido:
            prompt_final += f" (Archivo adjunto: {nombre_doc})"

        resultado = invocar_gemini_para_plan(
            prompt=prompt_final,
            historial=historial,
            cantidad_modulos=cantidad_modulos,
            duracion_personalizada=duracion_personalizada,
            texto_documento=texto_extraido if texto_extraido else None
        )

        tiene_plan = (
            resultado.get("tipo") == "plan_generado"
            or "plan" in resultado
            or "modulos" in resultado
        )

        if tiene_plan and (resultado.get("plan") or resultado.get("modulos")):
            if "plan" not in resultado:
                resultado = {
                    "tipo": "plan_generado",
                    "mensaje": "Plan generado con éxito",
                    "plan": resultado
                }

            resultado = guardar_plan_generado_en_bd(
                sesion,
                usuario_id,
                prompt_final,
                resultado
            )

            if nombre_doc:
                resultado["archivo_procesado"] = nombre_doc

        return resultado

    except HTTPException:
        sesion.rollback()
        raise
    except Exception as e:
        sesion.rollback()
        raise HTTPException(status_code=500, detail=str(e))