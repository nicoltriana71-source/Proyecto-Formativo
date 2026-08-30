from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Importa tus routers desde la carpeta app/rutas
from app.rutas import usuario, asignatura, plan_estudio, prompt_ia
from app.rutas.ia import router as ia_gemini_router

# Directorio raíz del proyecto
BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(
    title="StudNova API",
    description="API de plataforma de aprendizaje personalizado con IA",
    version="1.0.0"
)

# Configuración de CORS para conexión con Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción reemplaza "*" por la URL de tu frontend (ej. "http://localhost:5173")
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de rutas
# Inclusión de rutas de la API
app.include_router(usuario.router, prefix="/usuarios", tags=["Usuarios"])
app.include_router(asignatura.router, prefix="/asignaturas", tags=["Asignaturas"])
app.include_router(plan_estudio.router, prefix="/planes", tags=["Planes de Estudio"])
app.include_router(prompt_ia.router, prefix="/ia", tags=["Asistente IA"])
app.include_router(prompt_ia.router, prefix="/ia-asistente", tags=["Asistente IA"])
app.include_router(ia_gemini_router)

# Servir interfaces estáticas (HTML, CSS, JS)
app.mount("/ia", StaticFiles(directory=str(BASE_DIR / "ia"), html=True), name="ia")
app.mount("/principal", StaticFiles(directory=str(BASE_DIR / "principal"), html=True), name="principal")

@app.get("/", tags=["General"])
def inicio():
    return {
        "mensaje": "StudNova API funcionando correctamente"
        "mensaje": "StudNova API funcionando correctamente",
        "interfaz_ia": "/ia/interfaz.html",
        "docs": "/docs"
    }