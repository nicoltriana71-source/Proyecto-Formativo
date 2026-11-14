import json
from typing import Optional
from sqlmodel import Session

from backend.app.services.gemini import obtener_embedding
from backend.app.utilidades.vectores import calcular_similitud_coseno
from backend.app.repositories import ia as repositorio
from backend.app.utilidades.normalizacion import normalizar_texto, extraer_palabras_clave


def buscar_plan_en_cache(
    sesion: Session,
    texto_consulta: str,
    usuario_id: Optional[int] = None,
    umbral_similitud: float = 0.85
):
    texto_limpio = texto_consulta.strip()

    if len(texto_limpio) < 3:
        return None

    saludos_simples = {
        "hola", "buenas", "buenos dias", "buenas tardes",
        "buenas noches", "que tal", "como estas", "como te va",
        "como vas", "que haces", "como te encuentras", "ok",
        "gracias", "si", "no", "bien", "genial", "hola amor",
        "cambiar de tema", "que cuentas"
    }

    if normalizar_texto(texto_limpio) in saludos_simples:
        return None

    kw_usuario = extraer_palabras_clave(texto_limpio)
    if not kw_usuario:
        return None

    mejor_plan = None
    max_similitud = 0.0

    # 1. Buscar coincidencias por título y materia
    planes = repositorio.obtener_todos_los_planes(sesion)
    for plan in planes:
        materia = ""
        contenido = plan.contenido_json

        if isinstance(contenido, str):
            try:
                contenido = json.loads(contenido)
            except Exception:
                contenido = {}

        if isinstance(contenido, dict):
            materia = contenido.get("materia", "")

        texto_comparar = f"{plan.titulo or ''} {materia}"
        kw_plan = extraer_palabras_clave(texto_comparar)
        interseccion = kw_usuario.intersection(kw_plan)

        if interseccion:
            ratio = len(interseccion) / max(len(kw_usuario), 1)
            if ratio >= 0.5 or any(len(palabra) >= 4 for palabra in interseccion):
                mejor_plan = plan
                max_similitud = 1.0
                break

    # 2. Buscar coincidencias por asignatura
    if not mejor_plan:
        asignaturas = repositorio.obtener_asignaturas(sesion)
        for asignatura in asignaturas:
            if (
                not asignatura.nombre
                or asignatura.nombre.lower() in ("string", "general", "personalizado", "prueba")
            ):
                continue

            asig_norm = normalizar_texto(asignatura.nombre)
            asig_kw = extraer_palabras_clave(asignatura.nombre)

            if (
                (asig_norm and asig_norm in normalizar_texto(texto_limpio))
                or (asig_kw and bool(asig_kw.intersection(kw_usuario)))
            ):
                plan_asig = repositorio.obtener_plan_por_asignatura(sesion, asignatura.id_asignatura)
                if plan_asig and plan_asig.contenido_json:
                    mejor_plan = plan_asig
                    max_similitud = 1.0
                    break

    # 3. Buscar similitud mediante embeddings
    if not mejor_plan:
        emb_actual = obtener_embedding(texto_limpio)
        if emb_actual:
            prompts = repositorio.obtener_prompts_con_embedding(sesion)
            for prompt in prompts:
                try:
                    emb_guardado = json.loads(prompt.embedding)
                    similitud = calcular_similitud_coseno(emb_actual, emb_guardado)

                    if similitud >= umbral_similitud and similitud > max_similitud:
                        plan_asociado = repositorio.obtener_plan_por_id(sesion, prompt.id_plan)

                        if plan_asociado and plan_asociado.contenido_json:
                            contenido = plan_asociado.contenido_json
                            if isinstance(contenido, str):
                                contenido = json.loads(contenido)

                            materia_plan = str(contenido.get("materia", "")) if isinstance(contenido, dict) else ""
                            kw_plan = extraer_palabras_clave(
                                f"{plan_asociado.titulo} {materia_plan} {prompt.prompt_usuario}"
                            )

                            if kw_usuario and not kw_usuario.intersection(kw_plan):
                                continue

                            mejor_plan = plan_asociado
                            max_similitud = similitud
                except Exception as e:
                    print(f"Error al leer embedding de prompt {prompt.id_prompt}: {e}")
                    continue

    # 4. Devolver el plan encontrado
    if mejor_plan and mejor_plan.contenido_json:
        contenido = mejor_plan.contenido_json
        if isinstance(contenido, str):
            try:
                contenido = json.loads(contenido)
            except Exception:
                pass

        return {
            "tipo": "plan_generado",
            "mensaje": f"⚡ ¡He encontrado un plan de estudio ya preparado sobre {mejor_plan.titulo}!",
            "plan": contenido,
            "id_plan": mejor_plan.id_plan,
            "id_usuario": usuario_id or mejor_plan.id_usuario,
            "desde_cache": True,
            "similitud": round(max_similitud, 3)
        }

    return None