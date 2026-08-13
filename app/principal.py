from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, Response
from fastapi.staticfiles import StaticFiles

from app.base_datos import engine
import app.modelos  # Importa las tablas y resuelve relaciones
from app.rutas.usuario import router as usuarios_router
from app.rutas.ia import router as ia_router

# Directorio raíz del proyecto (Proyecto-Formativo/)
BASE_DIR = Path(__file__).resolve().parent.parent

app = FastAPI(
    title="StudNova API",
    version="1.0.0"
)

# -------------------------------------------------------------
# Configuración de CORS
# -------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# Rutas / Endpoints de la API
# -------------------------------------------------------------
app.include_router(usuarios_router)
app.include_router(ia_router)

# -------------------------------------------------------------
# Archivos Estáticos (Carpeta 'ia/')
# Permite servir automáticamente interfaz.html, css.css y todos 
# los archivos HTML, CSS y JS que la IA genere en esa carpeta.
# -------------------------------------------------------------
app.mount("/ia", StaticFiles(directory=str(BASE_DIR / "ia"), html=True), name="ia")


# -------------------------------------------------------------
# Redirecciones y utilidades
# -------------------------------------------------------------
@app.get("/")
def inicio():
    """Redirige automáticamente a la interfaz principal de la IA."""
    return RedirectResponse(url="/ia/interfaz.html")


@app.get("/favicon.ico")
def favicon():
    """Evita errores 404 al solicitar el favicon."""
    return Response(status_code=204)