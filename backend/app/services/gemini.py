#Conexión real con Gemini y Groq (sin planes simulados)
from pathlib import Path
import os
import json
import re
import requests
from dotenv import load_dotenv
from google import genai
from google.genai import types

from backend.app.utilidades.vectores import calcular_similitud_coseno
from backend.app.utilidades.quizzes import aleatorizar_quizzes_plan
from backend.app.services.ia_prompts import PROMPT_TUTOR_PROFUNDO

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent
load_dotenv(BASE_DIR / ".env")
load_dotenv(ROOT_DIR / ".env")

MODELOS_CASCADA = [
    "gemini-flash-lite-latest"
]


def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("No se encontró GEMINI_API_KEY en las variables de entorno o en el archivo .env")
    return genai.Client(api_key=api_key)


def obtener_embedding(texto: str) -> list:
    """Genera el embedding vectorial del texto utilizando el modelo oficial gemini-embedding-001."""
    if not texto or not texto.strip():
        return []
    try:
        client = get_gemini_client()
        resultado = client.models.embed_content(
            model="gemini-embedding-001",
            contents=texto.strip()
        )
        if resultado and resultado.embeddings:
            return resultado.embeddings[0].values
    except Exception as e:
        print(f"[IA Embeddings] Error al generar embedding: {e}")
    return []


def generar_codigo_ia(
    prompt_usuario: str,
    historial: list = None,
    nombre_archivo: str = "plan_estudio",
    texto_documento: str = None,
    cantidad_modulos: int = None,
    duracion_personalizada: str = None
):
    if historial is None:
        historial = []

    # Bloque de documento y especificaciones personalizadas
    bloque_documento = ""
    if texto_documento and texto_documento.strip():
        bloque_documento = f"""
DOCUMENTO / TEMARIO ADJUNTO POR EL ESTUDIANTE:
--------------------------------------------------
{texto_documento.strip()}
--------------------------------------------------
INSTRUCCIÓN OBLIGATORIA DEL DOCUMENTO:
Debes estructurar el plan de estudio basándote FIELMENTE en los temas, capítulos y conceptos de este documento adjunto. Genera directamente el plan pedagógico con "tipo": "plan_generado".
"""

    bloque_restricciones = ""
    if cantidad_modulos and int(cantidad_modulos) > 0:
        bloque_restricciones += f"\n- REQUISITO ESTRICTO DE MÓDULOS: El plan DEBE contener EXACTAMENTE {cantidad_modulos} módulos (ni más ni menos). Cada módulo DEBE tener lecciones profundas y EXACTAMENTE 3 mini quizzes basados en la teoría."
    else:
        bloque_restricciones += "\n- REQUISITO GENERAL DE MÓDULOS: Si vas a generar el plan, este DEBE tener entre 3 y 5 módulos progresivos y completos (NUNCA generes solo 1 módulo). Cada módulo DEBE tener EXACTAMENTE 3 mini quizzes."

    if duracion_personalizada and str(duracion_personalizada).strip():
        bloque_restricciones += f"\n- REQUISITO ESTRICTO DE TIEMPO: El plan debe estructurarse para completarse en {str(duracion_personalizada).strip()}. Si es 1 semana hábil (5 días), distribuye el contenido en 4 o 5 módulos con sesiones de 45-60 min cada una para que el tiempo sea formativo y realista."
    else:
        bloque_restricciones += "\n- REQUISITO DE CONTENIDO: Cada lección debe tener mínimo 3 a 4 párrafos de teoría profunda, ejemplo o código real comentado (prohibido N/A) y 3 preguntas de comprobación por módulo."

    # Historial de conversación
    conversacion_texto = ""
    for msg in historial:
        rol = "Estudiante" if msg.get("rol") == "usuario" else "Tutor StudNova"
        conversacion_texto += f"{rol}: {msg.get('texto')}\n"

    conversacion_texto += f"Estudiante: {prompt_usuario}\n"

    # Control de acción
    if bloque_documento or (cantidad_modulos and duracion_personalizada):
        instruccion_accion = "El estudiante ya proporcionó los parámetros necesarios o adjuntó un documento. GENERA DIRECTAMENTE el plan completo con 'tipo': 'plan_generado' cumpliendo la cantidad de módulos solicitada."
    else:
        instruccion_accion = "Lee atentamente el historial. Si el estudiante recién menciona el tema o solicitó un nuevo plan pero NO ha indicado la duración o los módulos deseados, RESPONDE CON 'tipo': 'conversacion' y pregúntale ambos datos antes de generar el plan. Si ya indicó ambos datos en los mensajes, genera el plan con 'tipo': 'plan_generado' con al menos 3 módulos."

    prompt_completo = f"""
INSTRUCCIONES DEL TUTOR STUDNOVA:
{PROMPT_TUTOR_PROFUNDO}
{bloque_documento}
{bloque_restricciones}

HISTORIAL DE LA CONVERSACIÓN ACUMULADA:
{conversacion_texto}

INSTRUCCIÓN ESPECÍFICA PARA ESTE TURNO:
{instruccion_accion}

Responde ÚNICAMENTE con JSON válido:
"""

    ultimo_error_gemini = None

    # 1. Intentar con Gemini
    try:
        configuracion = types.GenerateContentConfig(response_mime_type="application/json")
        client = get_gemini_client()
        for modelo in MODELOS_CASCADA:
            try:
                print(f"[IA Gemini] Procesando con {modelo}...")
                respuesta = client.models.generate_content(
                    model=modelo,
                    contents=prompt_completo,
                    config=configuracion
                )
                if respuesta and respuesta.text:
                    limpio = respuesta.text.strip()
                    if limpio.startswith("```"):
                        limpio = re.sub(r"^```(?:json)?\s*", "", limpio)
                        limpio = re.sub(r"\s*```$", "", limpio)
                    datos = json.loads(limpio)
                    datos["modelo_ia"] = f"gemini/{modelo}"
                    print(f"[IA Gemini] ¡Éxito con {modelo}!")
                    return aleatorizar_quizzes_plan(datos)
            except Exception as e_mod:
                ultimo_error_gemini = e_mod
                print(f"[IA Gemini] Error en modelo {modelo}: {e_mod}")
                continue
    except Exception as e_client:
        ultimo_error_gemini = e_client
        print(f"[IA Gemini] No se pudo inicializar cliente Gemini: {e_client}")

    # 2. Fallback con Groq
    groq_api_key = os.getenv("GROQ_API_KEY")
    ultimo_error_groq = None
    if groq_api_key:
        print(f"[IA Groq] Gemini no estuvo disponible ({ultimo_error_gemini}). Intentando con Groq...")
        groq_models = ["openai/gpt-oss-20b", "openai/gpt-oss-120b"]
        
        messages = [
            {
                "role": "system",
                "content": f"Eres el tutor pedagógico inteligente de StudNova IA. Debes responder EXCLUSIVAMENTE con un objeto JSON válido siguiendo estas reglas:\n\n{PROMPT_TUTOR_PROFUNDO}\n\n{bloque_restricciones}"
            }
        ]
        for msg in historial:
            rol = "user" if msg.get("rol") == "usuario" else "assistant"
            messages.append({"role": rol, "content": msg.get("texto") or ""})
            
        prompt_groq_final = f"{prompt_usuario}\n\n{instruccion_accion}"
        if bloque_documento:
            prompt_groq_final += f"\n\n{bloque_documento}"
        messages.append({"role": "user", "content": prompt_groq_final})

        for modelo in groq_models:
            try:
                print(f"[IA Groq] Procesando con {modelo}...")
                resp = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {groq_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": modelo,
                        "messages": messages,
                        "response_format": {"type": "json_object"},
                        "max_completion_tokens": 8192,
                        "temperature": 0.4
                    },
                    timeout=60
                )
                if resp.status_code == 200:
                    raw_content = resp.json()["choices"][0]["message"]["content"]
                    limpio = raw_content.strip()
                    if limpio.startswith("```"):
                        limpio = re.sub(r"^```(?:json)?\s*", "", limpio)
                        limpio = re.sub(r"\s*```$", "", limpio)
                    datos = json.loads(limpio)
                    datos["modelo_ia"] = f"groq/{modelo}"
                    print(f"[IA Groq] ¡Éxito con {modelo}!")
                    return aleatorizar_quizzes_plan(datos)
                else:
                    ultimo_error_groq = f"{resp.status_code} - {resp.text[:200]}"
                    print(f"[IA Groq] Error en {modelo}: {ultimo_error_groq}")
            except Exception as e_groq:
                ultimo_error_groq = e_groq
                print(f"[IA Groq] Excepción con {modelo}: {e_groq}")
                continue

    # Si ambos fallaron, lanzamos un error real sin simular planes falsos
    raise RuntimeError(
        f"No fue posible generar el plan con los modelos de IA. "
        f"Error Gemini: {ultimo_error_gemini} | Error Groq: {ultimo_error_groq}"
    )