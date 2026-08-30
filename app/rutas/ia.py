# app/rutas/ia.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uuid
from app.gemini import generar_codigo_ia

router = APIRouter(prefix="/api/ia", tags=["IA Generador"])

# Modelo para los mensajes previos del chat
class MensajeHistorial(BaseModel):
    rol: str   # "usuario" o "ia"
    texto: str

# Modelo de solicitud con memoria de conversación
class SolicitudGeneracion(BaseModel):
    prompt: str
    historial: Optional[List[MensajeHistorial]] = []

@router.post("/generar")
def generar_interfaz(solicitud: SolicitudGeneracion):
    if not solicitud.prompt.strip():
        raise HTTPException(status_code=400, detail="El prompt no puede estar vacío")
    
    try:
        nombre_vista = f"vista_{uuid.uuid4().hex[:8]}"
        
        # Convertir historial de Pydantic a diccionarios
        historial_dicts = [m.model_dump() for m in solicitud.historial]
        
        # Llamar a Gemini enviando el historial de la conversación
        resultado = generar_codigo_ia(
            prompt_usuario=solicitud.prompt,
            historial=historial_dicts,
            nombre_archivo=nombre_vista
        )
        
        # Retorna la respuesta real de Gemini (conversación o plan_generado)
        return resultado
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))