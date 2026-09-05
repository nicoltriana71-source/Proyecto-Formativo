from pathlib import Path
import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai.errors import ServerError, APIError

import math

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent
load_dotenv(BASE_DIR / ".env")
load_dotenv(ROOT_DIR / ".env")

MODELOS_CASCADA = [
    "gemini-3.5-flash-lite"
]

def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("No se encontró GEMINI_API_KEY en las variables de entorno o en el archivo .env")
    return genai.Client(api_key=api_key)


def calcular_similitud_coseno(vec_a: list, vec_b: list) -> float:
    """Calcula la similitud de coseno entre dos vectores numéricos (0.0 a 1.0)."""
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot_product / (norm_a * norm_b)


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


# PROMPT DINÁMICO Y NATURAL
PROMPT_TUTOR_PROFUNDO = """
Eres el tutor pedagógico inteligente y cercano de StudNova IA.
Tu objetivo es conversar de forma natural, empática y dinámica con el estudiante.

REGLAS DE CONVERSACIÓN (¡MUY IMPORTANTE!):
1. ¡NUNCA repitas el mismo mensaje de saludo en cada turno! Habla como un humano.
2. Responde directamente a lo que el estudiante acaba de escribir:
   - Si saluda o pregunta cómo estás: Responde con amabilidad y pregúntale qué le gustaría aprender hoy.
   - Si menciona una materia (ej: "robótica", "python", "álgebra"): Muestra entusiasmo por ese tema específico y hazle preguntas naturales (¿qué nivel tiene?, ¿cuántas horas o semanas tiene disponibles?, ¿quiere enfocarse en software o hardware?).
   - Si el estudiante da respuestas cortas (ej: "robótica", "2 semanas"): Conecta los datos con lo que dijo antes y pídele el último detalle que falte o confirma si quiere el plan.
3. SI YA TIENES LA MATERIA Y EL TIEMPO O NIVEL (o el estudiante pide el plan explícitamente): Genera el plan de estudio completo y profundo.

ESTRUCTURA DE RESPUESTA EN JSON PURO:

CASO 1: MIENTRAS ESTÉS CONVERSANDO O PIDIENDO DETALLES:
{
  "tipo": "conversacion",
  "mensaje": "Escribe aquí una respuesta única, natural y adaptada a lo que el estudiante acaba de decir (NUNCA uses una plantilla fija)."
}

CASO 2: CUANDO YA TENGAS LOS DATOS Y GENERES EL PLAN:
{
  "tipo": "plan_generado",
  "mensaje": "¡Excelente! He estructurado tu plan de estudio personalizado para [Materia] en [X tiempo]:",
  "plan": {
    "titulo": "Título atractivo y profesional del plan",
    "descripcion": "Objetivos pedagógicos del plan de estudio.",
    "materia": "Materia o tecnología",
    "recomendacion_fatiga": "Estudia 25 min y descansa 5 min para consolidar la memoria.",
    "modulos": [
      {
        "id": "mod-1",
        "nivel_tag": "Nivel 1: Fundamentos",
        "nivel_clase": "basico",
        "titulo": "Nombre del Módulo",
        "teoria_modulo": "Marco teórico del módulo explicando los conceptos fundamentales.",
        "lecciones": [
          {
            "titulo": "Nombre de la lección",
            "duracion_minutos": 45,
            "concepto_teorico": "Explicación conceptual profunda, didáctica y clara (mínimo 2 párrafos).",
            "puntos_clave": [
              "Regla o principio clave 1.",
              "Regla o principio clave 2."
            ],
            "ejemplo_codigo_o_formula": "Código real comentado o fórmula explicada paso a paso.",
            "ejercicio_practico": {
              "enunciado": "Problema práctico que el estudiante debe resolver.",
              "solucion_paso_a_paso": "Paso 1... Paso 2... Solución final explicada."
            }
          }
        ],
        "mini_quizzes": [
          {
            "titulo": "Comprobación de Concepto",
            "pregunta": "¿Pregunta conceptual clave?",
            "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
            "indice_correcto": 0,
            "explicacion": "Explicación de la respuesta."
          }
        ]
      }
    ]
  }
}
"""

def generar_codigo_ia(prompt_usuario: str, historial: list = None, nombre_archivo="plan_estudio"):
    if historial is None:
        historial = []

    # Construir el contexto acumulado de la conversación
    conversacion_texto = ""
    for msg in historial:
        rol = "Estudiante" if msg.get("rol") == "usuario" else "Tutor StudNova"
        conversacion_texto += f"{rol}: {msg.get('texto')}\n"

    conversacion_texto += f"Estudiante: {prompt_usuario}\n"

    prompt_completo = f"""
INSTRUCCIONES DEL TUTOR STUDNOVA:
{PROMPT_TUTOR_PROFUNDO}

HISTORIAL DE LA CONVERSACIÓN ACUMULADA:
{conversacion_texto}

INSTRUCCIÓN:
Lee atentamente todo el historial. Si faltan datos, responde conversando con "tipo": "conversacion" de forma única y humana. Si ya tienes la materia y el tiempo/nivel, genera el plan con "tipo": "plan_generado".
Responde ÚNICAMENTE con JSON válido:
"""

    configuracion = types.GenerateContentConfig(response_mime_type="application/json")
    texto_json = None
    client = get_gemini_client()
    ultimo_error = None

    for modelo in MODELOS_CASCADA:
        try:
            print(f"🚀 Procesando con {modelo}...")
            respuesta = client.models.generate_content(
                model=modelo,
                contents=prompt_completo,
                config=configuracion
            )
            if respuesta and respuesta.text:
                texto_json = respuesta.text
                break
        except Exception as e:
            ultimo_error = e
            print(f"⚠️ Error en modelo {modelo}: {e}")
            continue

    if not texto_json:
        raise Exception(f"No fue posible conectar con los servidores de Gemini: {ultimo_error}")

    datos = json.loads(texto_json)
    return datos