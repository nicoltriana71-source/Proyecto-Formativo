from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from base_datos import obtener_sesion

from backend.app.dependencias.auth import obtener_usuario_actual, verificar_propietario
from backend.app.esquemas.prompt_ia import (
    ChatSolicitud,
    PromptActualizar,
    PromptRespuesta,
)
from backend.app.modelos.usuario import Usuario
from backend.app.services.plan_estudio import obtener_detalle_plan
from backend.app.services.prompt_ia import (
    actualizar_prompt,
    eliminar_prompt,
    interactuar_ia,
    obtener_historial_plan,
    obtener_historial_usuario,
    obtener_prompt_por_id,
)


router = APIRouter(prefix="/prompt-ia", tags=["Asistente IA"])


@router.post("/chat", status_code=status.HTTP_201_CREATED)
def chat_ia(
    solicitud: ChatSolicitud,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    solicitud.id_usuario = usuario_actual.id_usuario
    return interactuar_ia(solicitud, sesion)


@router.get("/historial/plan/{id_plan}", response_model=list[PromptRespuesta])
def historial_plan(
    id_plan: int,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    detalle = obtener_detalle_plan(id_plan, sesion)
    verificar_propietario(detalle["plan"].id_usuario, usuario_actual, "plan de estudio")
    return obtener_historial_plan(id_plan, sesion)


@router.get("/historial/{id_usuario}", response_model=list[PromptRespuesta])
def historial_usuario(
    id_usuario: int,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    verificar_propietario(id_usuario, usuario_actual, "usuario")
    return obtener_historial_usuario(id_usuario, sesion)


@router.get("/{id_prompt}", response_model=PromptRespuesta)
def consultar_prompt(
    id_prompt: int,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    registro = obtener_prompt_por_id(id_prompt, sesion)
    verificar_propietario(registro.id_usuario, usuario_actual, "registro de historial")
    return registro


@router.put("/{id_prompt}", response_model=PromptRespuesta)
def modificar_prompt(
    id_prompt: int,
    datos_actualizar: PromptActualizar,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    registro = obtener_prompt_por_id(id_prompt, sesion)
    verificar_propietario(registro.id_usuario, usuario_actual, "registro de historial")
    datos_actualizar.id_usuario = usuario_actual.id_usuario
    return actualizar_prompt(id_prompt, datos_actualizar, sesion)


@router.delete("/{id_prompt}", status_code=status.HTTP_200_OK)
def borrar_prompt(
    id_prompt: int,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    registro = obtener_prompt_por_id(id_prompt, sesion)
    verificar_propietario(registro.id_usuario, usuario_actual, "registro de historial")
    return eliminar_prompt(id_prompt, sesion)
