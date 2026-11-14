import json
from sqlmodel import Session

from backend.app.gemini import obtener_embedding
from backend.app.repositories import ia as repositorio
from backend.app.utilidades.normalizacion import normalizar_a_dict


def guardar_plan_generado_en_bd(
    sesion: Session,
    usuario_id: int,
    prompt_texto: str,
    resultado: dict
) -> dict:

    if not isinstance(resultado, dict):
        return {
            "tipo": "error",
            "mensaje": "Respuesta no válida del generador"
        }

    plan_raw = resultado.get("plan") or resultado
    plan_data = normalizar_a_dict(plan_raw)

    nombre_materia = str(plan_data.get("materia") or "General")
    titulo_plan = str(plan_data.get("titulo") or "Plan de Estudio Personalizado")
    descripcion_plan = str(plan_data.get("descripcion") or "")

    plan_data["materia"] = nombre_materia
    plan_data["titulo"] = titulo_plan
    plan_data["descripcion"] = descripcion_plan

    # Registrar el plan
    nuevo_plan = repositorio.crear_plan(sesion, plan_data, usuario_id)
    plan_data["id_plan"] = nuevo_plan.id_plan

    modulos_list = plan_data.get("modulos", [])
    if not isinstance(modulos_list, list):
        modulos_list = []

    # Registrar módulos y temas
    for idx_m, modulo in enumerate(modulos_list):
        if not isinstance(modulo, dict):
            if isinstance(modulo, str):
                modulo = {"titulo": modulo, "teoria_modulo": modulo, "lecciones": []}
            else:
                modulo = {"titulo": f"Módulo {idx_m + 1}", "lecciones": []}
            modulos_list[idx_m] = modulo

        nuevo_modulo = repositorio.crear_modulo(
            sesion,
            nuevo_plan.id_plan,
            modulo,
            idx_m + 1
        )
        modulo["id_modulo"] = nuevo_modulo.id_modulo

        lecciones = modulo.get("lecciones", [])
        if not isinstance(lecciones, list):
            lecciones = []

        for idx_t, leccion in enumerate(lecciones):
            if not isinstance(leccion, dict):
                if isinstance(leccion, str):
                    leccion = {"titulo": leccion, "concepto_teorico": leccion}
                else:
                    leccion = {"titulo": f"Lección {idx_t + 1}"}
                lecciones[idx_t] = leccion

            nuevo_tema = repositorio.crear_tema(
                sesion,
                nuevo_modulo.id_modulo,
                leccion,
                idx_t + 1
            )
            leccion["id_tema"] = nuevo_tema.id_tema

        modulo["lecciones"] = lecciones

    plan_data["modulos"] = modulos_list

    repositorio.actualizar_contenido_plan(sesion, nuevo_plan, plan_data)

    # Crear embedding y registrar el prompt
    texto_embedding = f"{prompt_texto} {nombre_materia} {nuevo_plan.titulo}"
    vector_embedding = obtener_embedding(texto_embedding)

    repositorio.crear_registro_prompt(
        sesion=sesion,
        usuario_id=usuario_id,
        id_plan=nuevo_plan.id_plan,
        prompt_usuario=prompt_texto,
        prompt_sistema=resultado.get("mensaje") or "Plan generado",
        modelo_ia=resultado.get("modelo_ia", "gemini/gemini-3.5-flash-lite"),
        embedding=json.dumps(vector_embedding) if vector_embedding else None
    )

    resultado["id_plan"] = nuevo_plan.id_plan
    resultado["id_usuario"] = usuario_id
    resultado["plan"] = plan_data
    resultado["desde_cache"] = False

    return resultado