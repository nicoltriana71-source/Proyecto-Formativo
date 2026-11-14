import json
import re
import uuid
from typing import Optional, List, Dict, Any

from backend.app.services.gemini import generar_codigo_ia


def detectar_duracion(prompt: str, duracion_personalizada: Optional[str] = None) -> Optional[str]:
    if duracion_personalizada:
        return duracion_personalizada

    prompt_lower = prompt.lower()

    if "semana habil" in prompt_lower or "semana hábil" in prompt_lower:
        return "1 semana hábil (5 días de estudio de lunes a viernes)"

    if "semanas" in prompt_lower or "semana" in prompt_lower:
        coincidencia = re.search(r"(\d+)\s*semanas?", prompt_lower)
        if coincidencia:
            return f"{coincidencia.group(1)} semanas"
        elif "una semana" in prompt_lower:
            return "1 semana"

    if "dias" in prompt_lower or "días" in prompt_lower:
        coincidencia = re.search(r"(\d+)\s*d[ií]as?", prompt_lower)
        if coincidencia:
            return f"{coincidencia.group(1)} días"

    if "meses" in prompt_lower or "mes" in prompt_lower:
        coincidencia = re.search(r"(\d+)\s*mes(es)?", prompt_lower)
        if coincidencia:
            return f"{coincidencia.group(1)} meses"
        elif "un mes" in prompt_lower:
            return "1 mes"

    return None


def invocar_gemini_para_plan(
    prompt: str,
    historial: List[Dict[str, Any]],
    cantidad_modulos: Optional[int] = None,
    duracion_personalizada: Optional[str] = None,
    texto_documento: Optional[str] = None
) -> Dict[str, Any]:
    nombre_vista = f"vista_{uuid.uuid4().hex[:8]}"

    resultado = generar_codigo_ia(
        prompt_usuario=prompt,
        historial=historial,
        nombre_archivo=nombre_vista,
        texto_documento=texto_documento,
        cantidad_modulos=cantidad_modulos,
        duracion_personalizada=duracion_personalizada
    )

    if isinstance(resultado, str):
        try:
            resultado = json.loads(resultado)
        except Exception:
            resultado = {"tipo": "conversacion", "mensaje": resultado}

    if not isinstance(resultado, dict):
        resultado = {"tipo": "conversacion", "mensaje": str(resultado)}

    return resultado