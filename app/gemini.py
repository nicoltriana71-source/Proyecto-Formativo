from pathlib import Path
import os
from dotenv import load_dotenv
from google import genai
from app.procesador_ia import procesar_y_guardar_codigo

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("No se encontró GEMINI_API_KEY en app/.env")

client = genai.Client(api_key=API_KEY)


def preguntar_ia(pregunta: str) -> str:
    respuesta = client.models.generate_content(
        model="gemini-flash-latest",   
        contents=pregunta
    )
    return respuesta.text

#AQUI SE CREA EL PROMPT PARA QUE LA IA GENERE EL CODIGO HTML, CSS Y JS DE LA INTERFAZ WEB
def generar_codigo_ia(prompt_usuario: str, nombre_archivo="generado_ia"):
    prompt_completo = f"""
    Eres un diseñador web experto. Genera una interfaz web completa en HTML, CSS y JavaScript para lo siguiente:
    {prompt_usuario}
    
    Requisitos:
    - Incluye los estilos dentro de una etiqueta <style>.
    - Incluye la interactividad dentro de una etiqueta <script>.
    - El diseño debe ser moderno, limpio y responsivo.
    """
    
    respuesta = client.models.generate_content(
        model="gemini-flash-latest",   
        contents=prompt_completo
    )
    
    resultado = procesar_y_guardar_codigo(
        codigo_ia_crudo=respuesta.text,
        destino_carpeta="ia",
        nombre_base=nombre_archivo
    )
    
    return resultado