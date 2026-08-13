# app/rutas/ia.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import uuid
from app.gemini import generar_codigo_ia

# Cambiar el prefijo a /api/ia para evitar conflictos con los archivos estáticos
router = APIRouter(prefix="/api/ia", tags=["IA Generador"])

class SolicitudGeneracion(BaseModel):
    prompt: str

@router.post("/generar")
def generar_interfaz(solicitud: SolicitudGeneracion):
    if not solicitud.prompt.strip():
        raise HTTPException(status_code=400, detail="El prompt no puede estar vacío")
    
    try:
        nombre_vista = f"vista_{uuid.uuid4().hex[:8]}"
        
        resultado = generar_codigo_ia(
            prompt_usuario=solicitud.prompt,
            nombre_archivo=nombre_vista
        )
        
        return {
            "mensaje": "¡Vista generada con éxito!",
            "nombre_archivo": nombre_vista,
            "html": resultado["html"],
            "css": resultado["css"],
            "js": resultado["js"],
            "url_vista": f"/ia/{nombre_vista}.html"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))