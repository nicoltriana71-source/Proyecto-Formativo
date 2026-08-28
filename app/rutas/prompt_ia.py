from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from base_datos import obtener_sesion
from app.esquemas.prompt_ia import ChatSolicitud, GenerarPlanSolicitud
from app.modelos.prompt_ia import PromptIA
from app.modelos.plan_estudio import PlanDeEstudio

router = APIRouter()

@router.post("/chat")
def interactuar_ia(solicitud: ChatSolicitud, sesion: Session = Depends(obtener_sesion)):
    # Simulación de respuesta del modelo de IA (OpenAI / Gemini)
    respuesta_ia = f"Procesando tu solicitud sobre: '{solicitud.mensaje}'"
    
    registro_prompt = PromptIA(
        id_usuario=solicitud.id_usuario,
        id_plan=solicitud.id_plan,
        prompt_usuario=solicitud.mensaje,
        prompt_sistema=respuesta_ia
    )
    sesion.add(registro_prompt)
    sesion.commit()
    
    return {"respuesta": respuesta_ia}

@router.get("/historial/{id_usuario}")
def obtener_historial(id_usuario: int, sesion: Session = Depends(obtener_sesion)):
    statement = select(PromptIA).where(PromptIA.id_usuario == id_usuario)
    return sesion.exec(statement).all()