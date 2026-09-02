from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from base_datos import obtener_sesion
from app.esquemas.prompt_ia import ChatSolicitud, GenerarPlanSolicitud
from app.modelos.prompt_ia import PromptIA

router = APIRouter(prefix="/prompt-ia", tags=["Asistente IA"])

@router.post("/chat", status_code=status.HTTP_201_CREATED)
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
    sesion.refresh(registro_prompt)
    
    return {"respuesta": respuesta_ia, "registro": registro_prompt}

@router.get("/historial/{id_usuario}")
def obtener_historial(id_usuario: int, sesion: Session = Depends(obtener_sesion)):
    statement = select(PromptIA).where(PromptIA.id_usuario == id_usuario)
    return sesion.exec(statement).all()

@router.get("/historial/plan/{id_plan}")
def obtener_historial_por_plan(id_plan: int, sesion: Session = Depends(obtener_sesion)):
    statement = select(PromptIA).where(PromptIA.id_plan == id_plan)
    return sesion.exec(statement).all()

@router.get("/{id_prompt}", response_model=PromptIA)
def obtener_prompt_por_id(id_prompt: int, sesion: Session = Depends(obtener_sesion)):
    prompt = sesion.get(PromptIA, id_prompt)
    if not prompt:
        raise HTTPException(status_code=404, detail="Registro de interacción no encontrado.")
    return prompt

@router.put("/{id_prompt}", response_model=PromptIA)
def actualizar_prompt(id_prompt: int, datos_actualizar: PromptIA, sesion: Session = Depends(obtener_sesion)):
    prompt_db = sesion.get(PromptIA, id_prompt)
    if not prompt_db:
        raise HTTPException(status_code=404, detail="Registro de interacción no encontrado.")
    
    datos_dict = datos_actualizar.model_dump(exclude_unset=True)
    for key, value in datos_dict.items():
        if key != "id_prompt":
            setattr(prompt_db, key, value)
            
    sesion.add(prompt_db)
    sesion.commit()
    sesion.refresh(prompt_db)
    return prompt_db

@router.delete("/{id_prompt}", status_code=status.HTTP_200_OK)
def eliminar_prompt(id_prompt: int, sesion: Session = Depends(obtener_sesion)):
    prompt_db = sesion.get(PromptIA, id_prompt)
    if not prompt_db:
        raise HTTPException(status_code=404, detail="Registro de interacción no encontrado.")
    
    sesion.delete(prompt_db)
    sesion.commit()
    return {"mensaje": f"Registro de historial {id_prompt} eliminado correctamente."}