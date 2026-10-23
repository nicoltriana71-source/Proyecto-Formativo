from pathlib import Path
import os
import json
import re
import requests
from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai.errors import ServerError, APIError

import math
import random

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


# PROMPT DINÁMICO, PEDAGÓGICO Y MULTIMODULAR
PROMPT_TUTOR_PROFUNDO = """
Eres el tutor pedagógico inteligente y cercano de StudNova IA.
Tu objetivo es conversar de forma natural, empática y dinámica con el estudiante para estructurar su aprendizaje de forma personalizada con alta calidad académica.

REGLAS DE CONVERSACIÓN (¡OBLIGATORIAS!):
1. ¡NUNCA repitas el mismo mensaje de saludo en cada turno! Habla como un tutor humano cálido y motivador.
2. SI EL ESTUDIANTE INDICA UN TEMA O SOLICITA UN NUEVO PLAN (ej: "álgebra", "quiero aprender python", "crear un nuevo plan"):
   - NO generes el plan de inmediato si aún no tienes el tiempo disponible o la cantidad de módulos.
   - Responde con "tipo": "conversacion" mostrando entusiasmo por el tema y pregúntale amablemente:
     a) ¿En cuánto tiempo planea estudiarlo o completarlo? (ej: 2 semanas, 1 mes).
     b) ¿En cuántos módulos desea dividirlo? (recomiéndale entre 3 y 6 módulos para un progreso estructurado).
3. CUÁNDO GENERAR EL PLAN ("tipo": "plan_generado"):
   - ÚNICAMENTE genera el plan cuando el estudiante haya respondido o definido el tiempo estimado O la cantidad de módulos que desea.
   - O si el estudiante adjuntó un documento temario explícito.
4. REGLA ESTRICTA DE MÓDULOS:
   - Un plan de estudio NUNCA debe contener un solo módulo, a menos que el usuario lo pida expresamente.
   - Si el usuario solicitó N módulos, genera EXACTAMENTE N módulos bien diferenciados.
   - Si no especificó un número exacto pero ya dio el tiempo, genera por defecto entre 3 y 4 módulos progresivos (Fundamentos -> Profundización -> Aplicación Práctica).
5. REGLA ESTRICTA DE LECCIONES Y PROFUNDIDAD DE CONTENIDO (¡ALTA CALIDAD FORMATIVA!):
   - Cada módulo DEBE contener ENTRE 2 Y 3 LECCIONES COMPLETAS (NUNCA solo una lección simple o básica).
   - Las lecciones NO deben ser superficiales ni telegráficas. Cada lección debe contener:
     * "concepto_teorico": Explicación conceptual profunda, didáctica y completa (mínimo 3 a 5 párrafos ricos y claros). Debe detallar:
       - Definición formal y fundamentos conceptuales.
       - Cómo funciona internamente (mecanismos, lógica o bases teóricas).
       - Analogías didácticas y aplicaciones prácticas reales.
       - Errores comunes a evitar y buenas prácticas.
     * "puntos_clave": Lista de 3 a 5 principios, reglas clave, propiedades o fórmulas esenciales explicadas.
     * "ejemplo_codigo_o_formula": Código completo y funcional altamente comentado línea por línea, O formulación matemática analítica desarrollada paso a paso con su interpretación.
     * "ejercicio_practico":
       - "enunciado": Problema o caso práctico desafiante del mundo real para aplicar lo aprendido.
       - "solucion_paso_a_paso": Explicación desglosada paso a paso de cómo resolverlo analítica o computacionalmente.
6. REGLA ESTRICTA DE MINI QUIZZES (ALEATORIEDAD DE RESPUESTAS):
   - En cada módulo debe haber un mini quiz para comprobar la comprensión.
   - "indice_correcto": DEBE VARIAR ALEATORIAMENTE entre 0, 1, 2 y 3 (A, B, C o D). ¡PROHIBIDO poner siempre 0 (Opción A)! Distribuye las respuestas correctas de forma variada entre los módulos.
   - "opciones": 4 opciones de respuesta realistas y bien formuladas.
   - "explicacion": Justificación detallada de por qué la opción correcta es la acertada y por qué las demás son erróneas.

ESTRUCTURA DE RESPUESTA EN JSON PURO:

CASO 1: MIENTRAS ESTÉS CONVERSANDO O PIDIENDO DETALLES DE TIEMPO / MÓDULOS:
{
  "tipo": "conversacion",
  "mensaje": "Escribe aquí tu respuesta empática, preguntando el tiempo y número de módulos que desea el estudiante."
}

CASO 2: CUANDO YA TENGAS LOS PARÁMETROS Y GENERES EL PLAN COMPLETO:
{
  "tipo": "plan_generado",
  "mensaje": "¡Excelente! He estructurado tu plan de estudio personalizado para [Materia] en [X tiempo] distribuido en [N] módulos con lecciones profundas y prácticas:",
  "plan": {
    "titulo": "Título atractivo y profesional del plan",
    "descripcion": "Objetivos pedagógicos profundos y competencias a desarrollar.",
    "materia": "Materia o tecnología",
    "recomendacion_fatiga": "Estudia 25 min y descansa 5 min para consolidar la memoria.",
    "modulos": [
      {
        "id": "mod-1",
        "nivel_tag": "Nivel 1: Fundamentos y Arquitectura",
        "nivel_clase": "basico",
        "titulo": "Nombre del Módulo 1",
        "teoria_modulo": "Marco teórico global del módulo explicando los conceptos fundamentales y el alcance.",
        "lecciones": [
          {
            "titulo": "1.1 Introducción formal y conceptos pilares",
            "duracion_minutos": 45,
            "concepto_teorico": "Explicación conceptual profunda, didáctica y clara (mínimo 3 a 5 párrafos ricos). Explica la teoría formal, por qué existe, su importancia histórica o técnica, y cómo se relaciona con el panorama general.",
            "puntos_clave": [
              "Principio fundamental 1 con su impacto directo.",
              "Regla técnica 2 y consideraciones prácticas.",
              "Mecanismo clave 3 y cómo interactúa con el sistema."
            ],
            "ejemplo_codigo_o_formula": "Código o fórmula analítica extensamente comentada línea por línea.",
            "ejercicio_practico": {
              "enunciado": "Problema práctico contextualizado que el estudiante debe resolver.",
              "solucion_paso_a_paso": "Paso 1: Planteamiento analítico... Paso 2: Ejecución del procedimiento... Paso 3: Conclusión y verificación."
            }
          },
          {
            "titulo": "1.2 Métodos operativos y casos prácticos esenciales",
            "duracion_minutos": 50,
            "concepto_teorico": "Desarrollo técnico profundo de las herramientas y operaciones del módulo (mínimo 3 a 5 párrafos). Explicación minuciosa de los procedimientos estándar, buenas prácticas y advertencia de errores comunes.",
            "puntos_clave": [
              "Operación clave 1 y criterios de selección.",
              "Optimización de recursos y rendimiento.",
              "Patrones de uso recomendados en la industria."
            ],
            "ejemplo_codigo_o_formula": "Implementación técnica guiada y validación de resultados.",
            "ejercicio_practico": {
              "enunciado": "Caso aplicado donde se deben combinar los métodos estudiados.",
              "solucion_paso_a_paso": "Paso 1: Identificación de variables... Paso 2: Aplicación del método... Paso 3: Validación del resultado."
            }
          }
        ],
        "mini_quizzes": [
          {
            "titulo": "Comprobación de Concepto Módulo 1",
            "pregunta": "¿Cuál es el principio fundamental subyacente que rige este módulo?",
            "opciones": [
              "Distractor creíble 1",
              "Distractor creíble 2",
              "Respuesta correcta precisa y fundamentada",
              "Distractor creíble 3"
            ],
            "indice_correcto": 2,
            "explicacion": "Explicación detallada de por qué esta afirmación es la científicamente o técnicamente correcta."
          }
        ]
      },
      {
        "id": "mod-2",
        "nivel_tag": "Nivel 2: Profundización y Métodos",
        "nivel_clase": "intermedio",
        "titulo": "Nombre del Módulo 2",
        "teoria_modulo": "Marco teórico intermedio y métodos prácticos avanzados.",
        "lecciones": [
          {
            "titulo": "2.1 Técnicas intermedias y análisis estructural",
            "duracion_minutos": 50,
            "concepto_teorico": "Explicación técnica y práctica intermedia profunda (mínimo 3 a 5 párrafos). Análisis de complejidades, casos límite y algoritmos de resolución.",
            "puntos_clave": [
              "Regla de análisis estructural.",
              "Control de errores y validación.",
              "Integración con módulos previos."
            ],
            "ejemplo_codigo_o_formula": "Ejemplo intermedio completo con manejo de casos borde.",
            "ejercicio_practico": {
              "enunciado": "Problema analítico intermedio.",
              "solucion_paso_a_paso": "Paso 1: Formulación... Paso 2: Desarrollo sistemático... Paso 3: Solución."
            }
          },
          {
            "titulo": "2.2 Algoritmos de resolución y optimización",
            "duracion_minutos": 55,
            "concepto_teorico": "Explicación detallada de la optimización y algoritmos de resolución (mínimo 3 a 5 párrafos). Criterios de eficiencia y robustez.",
            "puntos_clave": [
              "Criterios de convergencia y eficiencia.",
              "Trade-offs entre exactitud y costo computacional.",
              "Métricas de evaluación del resultado."
            ],
            "ejemplo_codigo_o_formula": "Demostración de optimización aplicada con comentarios paso a paso.",
            "ejercicio_practico": {
              "enunciado": "Reto de optimización práctica.",
              "solucion_paso_a_paso": "Paso 1... Paso 2... Paso 3."
            }
          }
        ],
        "mini_quizzes": [
          {
            "titulo": "Comprobación de Concepto Módulo 2",
            "pregunta": "¿Qué ventaja crucial ofrece la optimización explicada en este módulo?",
            "opciones": [
              "Distractor creíble 1",
              "Respuesta correcta que describe la ventaja analítica",
              "Distractor creíble 2",
              "Distractor creíble 3"
            ],
            "indice_correcto": 1,
            "explicacion": "Explicación rigurosa de los beneficios técnicos y teóricos."
          }
        ]
      },
      {
        "id": "mod-3",
        "nivel_tag": "Nivel 3: Aplicación Avanzada y Proyectos",
        "nivel_clase": "avanzado",
        "titulo": "Nombre del Módulo 3",
        "teoria_modulo": "Integración global y aplicaciones en escenarios reales de alta complejidad.",
        "lecciones": [
          {
            "titulo": "3.1 Modelado de sistemas y soluciones integradas",
            "duracion_minutos": 60,
            "concepto_teorico": "Explicación avanzada orientada a resolver problemas del mundo real (mínimo 3 a 5 párrafos). Arquitectura integral y diseño de soluciones.",
            "puntos_clave": [
              "Patrones de arquitectura avanzada.",
              "Tolerancia a fallos y resiliencia.",
              "Mantenibilidad y escalabilidad."
            ],
            "ejemplo_codigo_o_formula": "Caso práctico integrado completo con arquitectura modular.",
            "ejercicio_practico": {
              "enunciado": "Reto integrador que combina todos los conocimientos previos.",
              "solucion_paso_a_paso": "Paso 1: Diseño... Paso 2: Implementación... Paso 3: Validación integral."
            }
          },
          {
            "titulo": "3.2 Diagnóstico, pruebas y despliegue profesional",
            "duracion_minutos": 60,
            "concepto_teorico": "Estrategias profesionales de validación, auditoría y puesta en producción (mínimo 3 a 5 párrafos). Criterios de calidad profesional.",
            "puntos_clave": [
              "Metodologías de testing y verificación.",
              "Monitoreo de métricas clave.",
              "Evolución y mantenimiento continuo."
            ],
            "ejemplo_codigo_o_formula": "Suite de pruebas o protocolo de validación documentado.",
            "ejercicio_practico": {
              "enunciado": "Auditoría y corrección de un caso real con anomalías.",
              "solucion_paso_a_paso": "Paso 1: Diagnóstico... Paso 2: Corrección... Paso 3: Informe."
            }
          }
        ],
        "mini_quizzes": [
          {
            "titulo": "Comprobación de Concepto Módulo 3",
            "pregunta": "¿Por qué es imprescindible validar las hipótesis antes de la implementación final?",
            "opciones": [
              "Distractor creíble 1",
              "Distractor creíble 2",
              "Distractor creíble 3",
              "Garantiza consistencia empírica y minimiza riesgos operativos"
            ],
            "indice_correcto": 3,
            "explicacion": "La validación temprana previene fallos estructurales costosos en entornos reales."
          }
        ]
      }
    ]
  }
}
"""

def aleatorizar_quizzes_plan(datos: dict) -> dict:
    """
    Asegura que las opciones de los mini quizzes se barajen aleatoriamente
    y se recalcule 'indice_correcto', garantizando que la respuesta correcta
    no sea siempre la 'A' (índice 0), sino que varíe aleatoriamente entre A, B, C y D.
    """
    if not isinstance(datos, dict):
        return datos

    plan = datos.get("plan") if isinstance(datos.get("plan"), dict) else datos
    if not isinstance(plan, dict):
        return datos

    modulos = plan.get("modulos")
    if not isinstance(modulos, list):
        return datos

    for mod in modulos:
        if not isinstance(mod, dict):
            continue
        quizzes = mod.get("mini_quizzes")
        if not isinstance(quizzes, list):
            quiz_unico = mod.get("quiz")
            if isinstance(quiz_unico, dict):
                quizzes = [quiz_unico]
            else:
                continue

        for q in quizzes:
            if not isinstance(q, dict):
                continue
            opciones = q.get("opciones")
            if isinstance(opciones, list) and len(opciones) > 1:
                idx_actual = q.get("indice_correcto", 0)
                if not isinstance(idx_actual, int) or idx_actual < 0 or idx_actual >= len(opciones):
                    idx_actual = 0
                
                resp_correcta = opciones[idx_actual]
                opciones_con_flag = [(opc, i == idx_actual) for i, opc in enumerate(opciones)]
                random.shuffle(opciones_con_flag)
                
                q["opciones"] = [opc for opc, flag in opciones_con_flag]
                q["indice_correcto"] = next(i for i, (opc, flag) in enumerate(opciones_con_flag) if flag)

    return datos


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

    # Construir bloque de documento y especificaciones personalizadas
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
        bloque_restricciones += f"\n- REQUISITO ESTRICTO DE MÓDULOS: El plan DEBE contener EXACTAMENTE {cantidad_modulos} módulos (ni más ni menos). Cada módulo DEBE tener al menos 2 lecciones profundas y mini quizzes."
    else:
        bloque_restricciones += "\n- REQUISITO GENERAL DE MÓDULOS: Si vas a generar el plan, este DEBE tener entre 3 y 5 módulos progresivos y completos (NUNCA generes solo 1 módulo). Cada módulo DEBE tener entre 2 y 3 lecciones completas."

    if duracion_personalizada and str(duracion_personalizada).strip():
        bloque_restricciones += f"\n- REQUISITO ESTRICTO DE TIEMPO: El plan debe estructurarse para completarse en {str(duracion_personalizada).strip()}."

    # -------------------------------------------------------------
    # 1. INTENTAR CON GEMINI (1ª OPCIÓN: gemini-flash-lite-latest)
    # -------------------------------------------------------------
    conversacion_texto = ""
    for msg in historial:
        rol = "Estudiante" if msg.get("rol") == "usuario" else "Tutor StudNova"
        conversacion_texto += f"{rol}: {msg.get('texto')}\n"

    conversacion_texto += f"Estudiante: {prompt_usuario}\n"

    # Control de acción: solo genera directo si hay documento o si ya se especificaron módulos y tiempo
    if bloque_documento or (cantidad_modulos and duracion_personalizada):
        instruccion_accion = "El estudiante ya proporcionó los parámetros necesarios o adjuntó un documento. GENERA DIRECTAMENTE el plan completo con 'tipo': 'plan_generado' cumpliendo la cantidad de módulos solicitada con al menos 2 lecciones ricas por módulo."
    else:
        instruccion_accion = "Lee atentamente el historial. Si el estudiante recién menciona el tema o solicitó un nuevo plan pero NO ha indicado la duración o los módulos deseados, RESPONDE CON 'tipo': 'conversacion' y pregúntale ambos datos antes de generar el plan. Si ya indicó ambos datos en los mensajes, genera el plan con 'tipo': 'plan_generado' con al menos 3 módulos y 2 lecciones profundas por módulo."

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

    try:
        configuracion = types.GenerateContentConfig(response_mime_type="application/json")
        client = get_gemini_client()
        for modelo in MODELOS_CASCADA:
            try:
                print(f"[IA Gemini] (Opción 1) Procesando con {modelo}...")
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

    # -------------------------------------------------------------
    # 2. INTENTAR CON GROQ (2ª OPCIÓN: Fallback si Gemini falla)
    # -------------------------------------------------------------
    groq_api_key = os.getenv("GROQ_API_KEY")
    ultimo_error_groq = None
    if groq_api_key:
        print(f"[IA Groq] Gemini no estuvo disponible ({ultimo_error_gemini}). Intentando con Groq (2ª opción)...")
        groq_models = [
            "openai/gpt-oss-20b",
            "openai/gpt-oss-120b"
        ]
        
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
                print(f"[IA Groq] (Opción 2) Procesando con {modelo}...")
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
    else:
        print("[IA Groq] GROQ_API_KEY no configurada para fallback.")

    # -------------------------------------------------------------
    # 3. MODO CONTINGENCIA SEGURO (Garantiza múltiples módulos)
    # -------------------------------------------------------------
    print(f"[IA Contingencia] Activando modo contingencia por error en proveedores (Gemini: {ultimo_error_gemini}, Groq: {ultimo_error_groq})")
    return aleatorizar_quizzes_plan(generar_plan_contingencia(prompt_usuario))


def generar_plan_contingencia(prompt_usuario: str) -> dict:
    prompt_limpio = prompt_usuario.lower()
    materia = "Álgebra Lineal" if "algebra" in prompt_limpio else \
              "Física Cuántica" if "fisica" in prompt_limpio or "cuantica" in prompt_limpio else \
              "Programación en Python" if "python" in prompt_limpio else \
              "Cálculo Diferencial" if "calculo" in prompt_limpio else \
              "Ciencia de Datos" if "datos" in prompt_limpio else \
              prompt_usuario.replace("creame un plan de estudio sobre", "").replace("creame un plan de estudios sobre", "").replace("crea un plan sobre", "").replace("quiero aprender", "").strip().title() or "Aprendizaje Personalizado"

    palabras_plan = ["plan", "estudio", "curso", "ruta", "aprender", "modulo", "modulos", "semana", "semanas"]
    es_solicitud_plan = any(p in prompt_limpio for p in palabras_plan)

    if not es_solicitud_plan and len(prompt_usuario.split()) < 4:
        return {
            "tipo": "conversacion",
            "mensaje": f"¡Hola! 👋 Me encanta el tema **{materia}**. Para armar tu plan a medida con lecciones profundas y detalladas, ¿en cuántas semanas planeas estudiarlo y en cuántos módulos te gustaría distribuirlo?"
        }

    return {
        "tipo": "plan_generado",
        "mensaje": f"✨ He generado tu plan de estudio avanzado sobre {materia} con módulos estructurados y lecciones profundas:",
        "plan": {
            "titulo": f"Dominio Integral y Práctico de {materia}",
            "descripcion": f"Ruta pedagógica profunda y estructurada en módulos progresivos con múltiples lecciones, fundamentos conceptuales rigurosos, ejemplos paso a paso y comprobaciones de conceptos para {materia}.",
            "materia": materia,
            "recomendacion_fatiga": "Estudia 25 minutos seguidos con enfoque pleno y realiza 5 minutos de pausa activa para consolidar la memoria.",
            "modulos": [
                {
                    "id": "mod-1",
                    "nivel_tag": "Nivel 1: Fundamentos y Arquitectura",
                    "nivel_clase": "basico",
                    "titulo": f"Fundamentos Teóricos y Principios Clave de {materia}",
                    "teoria_modulo": f"Marco conceptual fundamental para comprender la naturaleza, el alcance y las leyes esenciales que gobiernan {materia}.",
                    "lecciones": [
                        {
                            "titulo": f"1.1 Definición formal, motivación y pilares de {materia}",
                            "duracion_minutos": 45,
                            "concepto_teorico": f"Para abordar con éxito {materia}, es indispensable comprender las raíces conceptuales y la motivación teórica detrás de cada postulado.\n\nEn este nivel inicial, se exploran las definiciones rigurosas que diferencian este campo de disciplinas afines, permitiendo al estudiante construir un modelo mental coherente y sólido.\n\nComprender los axiomas fundamentales no solo facilita la deducción lógica, sino que previene los errores intuitivos más habituales al analizar problemas más complejos.",
                            "puntos_clave": [
                                f"Axiomas y definiciones formales constitutivas en {materia}.",
                                "Notación matemática y simbología estándar empleada internacionalmente.",
                                "Estructuras algebraicas y leyes de composición interna.",
                                "Casos representativos y contraejemplos analíticos."
                            ],
                            "ejemplo_codigo_o_formula": "Demostración guiada del axioma fundamental y comprobación de sus propiedades de clausura y asociatividad.",
                            "ejercicio_practico": {
                                "enunciado": f"Verifica formalmente si el conjunto de elementos dados cumple con los axiomas estructurales de {materia}.",
                                "solucion_paso_a_paso": "Paso 1: Identificar las hipótesis del enunciado y el dominio de trabajo.\nPaso 2: Comprobar la propiedad de cerradura bajo las operaciones definidas.\nPaso 3: Validar la existencia de elemento neutro y elemento inverso.\nPaso 4: Concluir formalmente sobre la validez del sistema."
                            }
                        },
                        {
                            "titulo": f"1.2 Interpretación analítica y primeros métodos operativos",
                            "duracion_minutos": 50,
                            "concepto_teorico": f"Una vez asimiladas las definiciones teóricas, el siguiente paso pedagógico consiste en traducir estos principios en procedimientos sistemáticos y manipulables.\n\nAprenderás cómo representar formalmente sistemas dinámicos o algebraicos mediante modelos simplificados pero matemáticamente exactos.\n\nSe analizan las condiciones de consistencia y los criterios de validez antes de proceder a cualquier cálculo o implementación.",
                            "puntos_clave": [
                                "Representación sistemática de entidades en coordenadas o variables de estado.",
                                "Operaciones elementales que preservan las propiedades del sistema.",
                                "Identificación temprana de indeterminaciones y singularidades."
                            ],
                            "ejemplo_codigo_o_formula": "Algoritmo paso a paso para la reducción y verificación de consistencia del sistema base.",
                            "ejercicio_practico": {
                                "enunciado": f"Aplica las operaciones elementales para simplificar la estructura presentada e interpreta el resultado obtenido.",
                                "solucion_paso_a_paso": "Paso 1: Representar la estructura en su forma canónica.\nPaso 2: Aplicar transformaciones lineales o algebraicas equivalentes.\nPaso 3: Interpretar el resultado en el contexto original del problema."
                            }
                        }
                    ],
                    "mini_quizzes": [
                        {
                            "titulo": "Comprobación de Concepto Módulo 1",
                            "pregunta": f"¿Por qué es imprescindible verificar los axiomas estructurales antes de aplicar fórmulas avanzadas en {materia}?",
                            "opciones": [
                                "Porque las fórmulas avanzadas son válidas en cualquier sistema sin importar sus propiedades",
                                "Para evitar tener que justificar formalmente los resultados analíticos",
                                "Garantiza que el sistema cumple las condiciones de consistencia bajo las cuales los teoremas fueron demostrados",
                                "Simplemente para cumplir un requisito de presentación sin impacto en la exactitud"
                            ],
                            "indice_correcto": 2,
                            "explicacion": "La aplicación de teoremas avanzados requiere estrictamente que se satisfagan las hipótesis y axiomas que los sustentan."
                        }
                    ]
                },
                {
                    "id": "mod-2",
                    "nivel_tag": "Nivel 2: Operaciones y Transformaciones",
                    "nivel_clase": "intermedio",
                    "titulo": f"Métodos Operativos, Algoritmos y Transformaciones en {materia}",
                    "teoria_modulo": f"Profundización en técnicas avanzadas de manipulación estructurada, algoritmos de resolución y análisis de convergencia en {materia}.",
                    "lecciones": [
                        {
                            "titulo": "2.1 Descomposición sistemática y algoritmos canónicos",
                            "duracion_minutos": 50,
                            "concepto_teorico": f"La resolución eficiente de problemas intermedios en {materia} exige métodos sistemáticos en lugar de enfoques heurísticos ad-hoc.\n\nEn esta lección se estudian los algoritmos canónicos que permiten descomponer sistemas de alta dimensión en componentes desacoplados o triangulares más fáciles de manipular.\n\nComprender el costo analítico y computacional de cada técnica permite seleccionar el método idóneo según la escala del problema.",
                            "puntos_clave": [
                                "Métodos de factorización y descomposición canónica.",
                                "Invariantes bajo transformaciones canónicas.",
                                "Criterios de estabilidad numérica y prevención de pérdidas de precisión."
                            ],
                            "ejemplo_codigo_o_formula": "Implementación comentada de la factorización paso a paso con validación de invariantes.",
                            "ejercicio_practico": {
                                "enunciado": "Aplica la técnica de descomposición al sistema propuesto y evalúa la estabilidad del resultado.",
                                "solucion_paso_a_paso": "Paso 1: Descomponer la matriz o sistema en sus factores elementales.\nPaso 2: Resolver los subsistemas triangulares mediante sustitución sucesiva.\nPaso 3: Comprobar la exactitud multiplicando los factores resultantes."
                            }
                        },
                        {
                            "titulo": "2.2 Optimización de procesos y análisis de sensibilidad",
                            "duracion_minutos": 55,
                            "concepto_teorico": f"En el mundo profesional, los problemas rara vez se presentan en condiciones ideales; los datos contienen ruido e incertidumbre.\n\nEl análisis de sensibilidad permite evaluar cómo pequeñas perturbaciones en las entradas impactan la solución final, identificando posibles puntos de inestabilidad.\n\nSe profundiza en métricas formales de condicionamiento y en estrategias para regularizar problemas mal condicionados.",
                            "puntos_clave": [
                                "Número de condición y su impacto en la propagación de errores.",
                                "Técnicas de regularización para mitigar el sobreajuste o la inestabilidad.",
                                "Monitoreo de residuos y convergencia de aproximaciones sucesivas."
                            ],
                            "ejemplo_codigo_o_formula": "Cálculo del índice de condicionamiento y simulación de perturbaciones controladas.",
                            "ejercicio_practico": {
                                "enunciado": "Determina si el sistema planteado está bien condicionado y propón una modificación para mejorar su estabilidad.",
                                "solucion_paso_a_paso": "Paso 1: Calcular la norma del operador y su inversa.\nPaso 2: Obtener el número de condición del sistema.\nPaso 3: Identificar la fila o columna crítica que introduce inestabilidad.\nPaso 4: Aplicar la técnica de preacondicionamiento adecuada."
                            }
                        }
                    ],
                    "mini_quizzes": [
                        {
                            "titulo": "Comprobación de Concepto Módulo 2",
                            "pregunta": "¿Qué ventaja clave aporta descomponer un sistema complejo en factores triangulares o canónicos?",
                            "opciones": [
                                "Aumenta la dimensión del problema sin alterar el tiempo de cómputo",
                                "Reduce la complejidad computacional y facilita la resolución por sustitución hacia adelante o atrás",
                                "Elimina la necesidad de conocer las variables iniciales del modelo",
                                "Garantiza que cualquier sistema singular tenga solución única"
                            ],
                            "indice_correcto": 1,
                            "explicacion": "Los sistemas triangulares o canónicos se resuelven en orden cuadrático en lugar de cúbico, maximizando la eficiencia analítica."
                        }
                    ]
                },
                {
                    "id": "mod-3",
                    "nivel_tag": "Nivel 3: Aplicación Avanzada y Proyectos",
                    "nivel_clase": "avanzado",
                    "titulo": f"Modelado Real, Integración y Proyectos con {materia}",
                    "teoria_modulo": f"Integración integral del conocimiento adquirido para formular, validar y optimizar soluciones a problemas reales de alta complejidad.",
                    "lecciones": [
                        {
                            "titulo": "3.1 Modelado de sistemas y traducción de fenómenos reales",
                            "duracion_minutos": 60,
                            "concepto_teorico": f"El valor supremo de dominar {materia} radica en la capacidad de modelar escenarios reales provenientes de la física, la computación, la ingeniería o la economía.\n\nEsta lección te guía a través del ciclo completo de modelado: desde la abstracción de variables físicas hasta la formulación matemática y su resolución estructurada.\n\nSe analizan las compensaciones (trade-offs) entre la fidelidad del modelo y su viabilidad analítica o computacional.",
                            "puntos_clave": [
                                "Identificación de grados de libertad, restricciones y variables de decisión.",
                                "Formulación matemática rigurosa orientada a objetivos específicos.",
                                "Validación de coherencia dimensional y comportamiento asintótico."
                            ],
                            "ejemplo_codigo_o_formula": "Caso práctico integral: formulación, resolución numérica y visualización de la solución óptima.",
                            "ejercicio_practico": {
                                "enunciado": "Formula el modelo matemático correspondiente al escenario industrial descrito y calcula los parámetros óptimos de operación.",
                                "solucion_paso_a_paso": "Paso 1: Definir formalmente las variables y los límites de operación.\nPaso 2: Establecer la función objetivo y las restricciones del problema.\nPaso 3: Resolver analítica o computacionalmente el modelo formulado.\nPaso 4: Redactar la interpretación técnica de los resultados para la toma de decisiones."
                            }
                        },
                        {
                            "titulo": "3.2 Diagnóstico, validación empírica y buenas prácticas profesionales",
                            "duracion_minutos": 60,
                            "concepto_teorico": f"Ningún modelo está completo sin una fase rigurosa de validación frente a datos empíricos u observaciones independientes.\n\nAprenderás los protocolos estándar de validación cruzada, análisis de residuales y pruebas de estrés para certificar la fiabilidad de tu solución.\n\nSe concluye con las mejores prácticas profesionales para documentar y presentar planes de estudio y proyectos técnicos con el máximo estándar de calidad.",
                            "puntos_clave": [
                                "Protocolos de validación cruzada y pruebas de bondad de ajuste.",
                                "Detección de anomalías y sesgos en las soluciones proyectadas.",
                                "Estrategias de documentación técnica clara y reproducible."
                            ],
                            "ejemplo_codigo_o_formula": "Suite de verificación de calidad del modelo con gráficos de residuales e intervalos de confianza.",
                            "ejercicio_practico": {
                                "enunciado": "Realiza la auditoría del modelo propuesto, identifica anomalías en los residuales y presenta el informe de corrección.",
                                "solucion_paso_a_paso": "Paso 1: Evaluar los errores residuales entre el modelo y los datos de prueba.\nPaso 2: Comprobar la normalidad y homocedasticidad de los errores.\nPaso 3: Proponer el ajuste correctivo sobre los parámetros sensibles.\nPaso 4: Concluir con la certificación técnica de validez del modelo."
                            }
                        }
                    ],
                    "mini_quizzes": [
                        {
                            "titulo": "Comprobación de Concepto Módulo 3",
                            "pregunta": "¿Cuál es la consecuencia más grave de omitir la validación de residuales en un modelo aplicado?",
                            "opciones": [
                                "El modelo tardará unos segundos más en compilar",
                                "Los nombres de las variables pueden desordenarse en el reporte final",
                                "No se podrán imprimir los gráficos en formato vectorial",
                                "El modelo puede estar sobreajustado o sesgado, generando predicciones erróneas y fallos críticos en la práctica"
                            ],
                            "indice_correcto": 3,
                            "explicacion": "La validación empírica de residuales es la única garantía de que el modelo generaliza correctamente hacia situaciones reales no vistas previamente."
                        }
                    ]
                }
            ]
        }
    }