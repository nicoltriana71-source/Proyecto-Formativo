from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse

from base_datos import crear_tablas

# Importación de los 9 módulos del sistema
from backend.app.rutas import (
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
from backend.app.rutas.ia import router as ia_gemini_router

# Directorio raíz del proyecto
BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR / "frontend"

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

# Vistas que se sirven directamente antes de los montajes estáticos
@app.get("/login", tags=["Vistas"])
def vista_login():
    return FileResponse(FRONTEND_DIR / "login" / "login.html")

# Servir interfaces estáticas (HTML, CSS, JS) si existen las carpetas
if (FRONTEND_DIR / "shared").exists():
    app.mount("/shared", StaticFiles(directory=str(FRONTEND_DIR / "shared")), name="shared")
if (FRONTEND_DIR / "chat").exists():
    app.mount("/ia", StaticFiles(directory=str(FRONTEND_DIR / "chat"), html=True), name="ia")
if (FRONTEND_DIR / "plan").exists():
    app.mount("/plan", StaticFiles(directory=str(FRONTEND_DIR / "plan"), html=True), name="plan")
if (FRONTEND_DIR / "login").exists():
    app.mount("/login", StaticFiles(directory=str(FRONTEND_DIR / "login"), html=True), name="login")
if (FRONTEND_DIR / "legal").exists():
    app.mount("/legal", StaticFiles(directory=str(FRONTEND_DIR / "legal"), html=True), name="legal")
if (FRONTEND_DIR / "landing").exists():
    app.mount("/landing", StaticFiles(directory=str(FRONTEND_DIR / "landing"), html=True), name="landing")

@app.get("/register", tags=["Vistas"])
@app.get("/registro", tags=["Vistas"])
def vista_registro():
    return FileResponse(FRONTEND_DIR / "login" / "login.html")

@app.get("/", tags=["General"])
def inicio():
    return {
        "mensaje": "StudNova API funcionando correctamente",
        "docs": "/docs",
        "login": "/login",
        "interfaz_ia": "/ia/interfaz.html"
    }