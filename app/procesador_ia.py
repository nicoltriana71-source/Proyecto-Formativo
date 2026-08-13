import os
import re
from pathlib import Path
from bs4 import BeautifulSoup

# Directorio raíz del proyecto (un nivel arriba de 'app/')
BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent

def limpiar_bloques_markdown(texto):
    """Elimina las comillas triples de markdown (```html ... ```) si Gemini las incluye."""
    patron = r"^```(?:html|xml)?\s*(.*?)\s*```$"
    match = re.search(patron, texto.strip(), re.DOTALL)
    if match:
        return match.group(1).strip()
    return texto.strip()

def procesar_y_guardar_codigo(codigo_ia_crudo, destino_carpeta="ia", nombre_base="generado_ia"):
    """
    Parsea el HTML de Gemini, separa CSS, JS y HTML,
    y los guarda en la carpeta correspondiente.
    """
    # 1. Limpiar posibles bloques markdown ```html ... ```
    codigo_limpio = limpiar_bloques_markdown(codigo_ia_crudo)
    
    # 2. Parsear con BeautifulSoup
    soup = BeautifulSoup(codigo_limpio, 'html.parser')
    
    # Extraer estilos CSS (<style>)
    estilos = []
    for tag_style in soup.find_all('style'):
        if tag_style.string:
            estilos.append(tag_style.string.strip())
        tag_style.decompose()  # Remueve <style> del HTML
    css_final = "\n\n".join(estilos)
    
    # Extraer JavaScript (<script>)
    scripts = []
    for tag_script in soup.find_all('script'):
        if tag_script.string:
            scripts.append(tag_script.string.strip())
            tag_script.decompose()  # Remueve <script> del HTML
    js_final = "\n\n".join(scripts)
    
    # Extraer el cuerpo/HTML restante
    if soup.body:
        html_contenido = soup.body.decode_contents()
    else:
        html_contenido = str(soup)
        
    # 3. Construir rutas absolutas seguras hacia la carpeta destino (ej. 'ia/')
    carpeta_destino = ROOT_DIR / destino_carpeta
    carpeta_destino.mkdir(parents=True, exist_ok=True)
    
    ruta_html = carpeta_destino / f"{nombre_base}.html"
    ruta_css  = carpeta_destino / f"{nombre_base}.css"
    ruta_js   = carpeta_destino / f"{nombre_base}.js"
    
    # 4. Guardar archivo CSS
    with open(ruta_css, "w", encoding="utf-8") as f:
        f.write(css_final)
        
    # 5. Guardar archivo JS
    with open(ruta_js, "w", encoding="utf-8") as f:
        f.write(js_final)
        
    # 6. Guardar archivo HTML (vinculando su CSS y JS)
    plantilla_final = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StudNova IA - Vista Generada</title>
    <link rel="stylesheet" href="{nombre_base}.css">
</head>
<body>

{html_contenido.strip()}

    <script src="{nombre_base}.js"></script>
</body>
</html>
"""

    with open(ruta_html, "w", encoding="utf-8") as f:
        f.write(plantilla_final)
        
    return {
        "html": html_contenido.strip(),
        "css": css_final,
        "js": js_final,
        "rutas": {
            "html": str(ruta_html),
            "css": str(ruta_css),
            "js": str(ruta_js)
        }
    }