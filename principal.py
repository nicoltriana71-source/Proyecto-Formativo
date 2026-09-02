from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from base_datos import crear_tablas

# Importación de los 9 módulos del sistema
from app.rutas import (
    usuario,
    asignatura,
    plan_estudio,
    prompt_ia,
    modulo,
    tema,
    control_fatiga,
    progreso,
    sesion_estudio,
)
from app.rutas.ia import router as ia_gemini_router

# Directorio raíz del proyecto
BASE_DIR = Path(__file__).resolve().parent

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crear tablas automáticamente si no existen
    try:
        crear_tablas()
    except Exception as e:
        print(f"⚠️ Advertencia al conectar con la base de datos: {e}")
    yield

app = FastAPI(
    title="StudNova API",
    description="API de plataforma de aprendizaje personalizado con IA",
    version="1.0.0",
    lifespan=lifespan
)

# Configuración de CORS para conexión con Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de los enrutadores del sistema
app.include_router(usuario.router)
app.include_router(asignatura.router)
app.include_router(plan_estudio.router)
app.include_router(prompt_ia.router)
app.include_router(modulo.router)
app.include_router(tema.router)
app.include_router(control_fatiga.router)
app.include_router(progreso.router)
app.include_router(sesion_estudio.router)
app.include_router(ia_gemini_router)

# Servir interfaces estáticas (HTML, CSS, JS) si existen las carpetas
if (BASE_DIR / "ia").exists():
    app.mount("/ia", StaticFiles(directory=str(BASE_DIR / "ia"), html=True), name="ia")
if (BASE_DIR / "principal").exists():
    app.mount("/principal", StaticFiles(directory=str(BASE_DIR / "principal"), html=True), name="principal")

@app.get("/", tags=["General"])
def inicio():
    return {
        "mensaje": "StudNova API funcionando correctamente",
        "docs": "/docs"
    }