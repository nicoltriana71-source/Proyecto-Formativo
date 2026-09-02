from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importa todos tus routers desde la carpeta app/rutas
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

app = FastAPI(
    title="StudNova API",
    description="API de plataforma de aprendizaje personalizado con IA",
    version="1.0.0",
)

# Configuración de CORS para conexión con Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción reemplaza "*" por la URL de tu frontend (ej. "http://localhost:5173")
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de los 9 enrutadores
app.include_router(usuario.router)
app.include_router(asignatura.router)
app.include_router(plan_estudio.router)
app.include_router(prompt_ia.router)
app.include_router(modulo.router)
app.include_router(tema.router)
app.include_router(control_fatiga.router)
app.include_router(progreso.router)
app.include_router(sesion_estudio.router)


@app.get("/", tags=["General"])
def inicio():
    return {"mensaje": "StudNova API funcionando correctamente"}