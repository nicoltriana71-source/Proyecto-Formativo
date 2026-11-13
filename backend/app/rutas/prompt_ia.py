from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from base_datos import obtener_sesion

from backend.app.esquemas.prompt_ia import (
    ChatSolicitud,
    PromptActualizar,
    PromptRespuesta
)

from backend.app.services.prompt_ia import (
    interactuar_ia,
    obtener_historial_usuario,
    obtener_historial_plan,
    obtener_prompt_por_id,
    actualizar_prompt,
    eliminar_prompt
)

router = APIRouter(
    prefix="/prompt-ia",
    tags=["Asistente IA"]
)

@router.post("/chat", status_code=status.HTTP_201_CREATED)
def chat_ia(
    solicitud: ChatSolicitud,
    sesion: Session = Depends(obtener_sesion)
):
    return interactuar_ia(solicitud, sesion)

@router.get("/historial/{id_usuario}", response_model=list[PromptRespuesta])
def historial_usuario(
    id_usuario: int,
    sesion: Session = Depends(obtener_sesion)
):
    return obtener_historial_usuario(id_usuario, sesion)

@router.get("/historial/plan/{id_plan}", response_model=list[PromptRespuesta])
def historial_plan(
    id_plan: int,
    sesion: Session = Depends(obtener_sesion)
):
    return obtener_historial_plan(id_plan, sesion)

@router.get("/{id_prompt}", response_model=PromptRespuesta)
def consultar_prompt(
    id_prompt: int,
    sesion: Session = Depends(obtener_sesion)
):
    return obtener_prompt_por_id(id_prompt, sesion)

@router.put("/{id_prompt}", response_model=PromptRespuesta)
def modificar_prompt(
    id_prompt: int,
    datos_actualizar: PromptActualizar,
    sesion: Session = Depends(obtener_sesion)
):
    return actualizar_prompt(
        id_prompt,
        datos_actualizar,
        sesion
    )

@router.delete("/{id_prompt}", status_code=status.HTTP_200_OK)
def borrar_prompt(
    id_prompt: int,
    sesion: Session = Depends(obtener_sesion)
):
    return eliminar_prompt(id_prompt, sesion)