from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importa tus routers desde la carpeta app/rutas
from app.rutas import usuario, asignatura, plan_estudio, prompt_ia

app = FastAPI(
    title="StudNova API",
    description="API de plataforma de aprendizaje personalizado con IA",
    version="1.0.0"
)

# Configuración de CORS para conexión con Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción reemplaza "*" por la URL de tu frontend (ej. "http://localhost:5173")
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de rutas
app.include_router(usuario.router, prefix="/usuarios", tags=["Usuarios"])
app.include_router(asignatura.router, prefix="/asignaturas", tags=["Asignaturas"])
app.include_router(plan_estudio.router, prefix="/planes", tags=["Planes de Estudio"])
app.include_router(prompt_ia.router, prefix="/ia", tags=["Asistente IA"])

@app.get("/", tags=["General"])
def inicio():
    return {
        "mensaje": "StudNova API funcionando correctamente"
    }