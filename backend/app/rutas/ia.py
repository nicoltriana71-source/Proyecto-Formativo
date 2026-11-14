from typing import Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlmodel import Session

from base_datos import obtener_sesion

from backend.app.dependencias.auth import obtener_usuario_actual
from backend.app.esquemas.ia import SolicitudAceptarPlan, SolicitudGeneracion
from backend.app.modelos.usuario import Usuario
from backend.app.services.ia import (
    aceptar_plan_sugerido as servicio_aceptar_plan,
    generar_plan as servicio_generar_plan,
    generar_plan_con_archivo as servicio_generar_con_archivo,
)


router = APIRouter(prefix="/api/ia", tags=["IA Generador"])


@router.post("/generar", summary="Generar plan de estudio con IA")
def generar_plan(
    solicitud: SolicitudGeneracion,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    solicitud.id_usuario = usuario_actual.id_usuario
    return servicio_generar_plan(solicitud, sesion)


@router.post("/aceptar-sugerencia", summary="Aceptar plan sugerido existente")
def aceptar_sugerencia(
    solicitud: SolicitudAceptarPlan,
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    solicitud.id_usuario = usuario_actual.id_usuario
    return servicio_aceptar_plan(solicitud, sesion)


@router.post(
    "/generar-con-archivo",
    summary="Generar plan de estudio a partir de un documento adjunto",
)
async def generar_plan_con_archivo(
    prompt: str = Form("Genera un plan de estudio a partir de este documento."),
    cantidad_modulos: Optional[int] = Form(None),
    duracion_personalizada: Optional[str] = Form(None),
    historial_json: Optional[str] = Form(None),
    archivo: Optional[UploadFile] = File(None),
    forzar_nuevo: bool = Form(False),
    sesion: Session = Depends(obtener_sesion),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    return await servicio_generar_con_archivo(
        prompt=prompt,
        id_usuario=usuario_actual.id_usuario,
        cantidad_modulos=cantidad_modulos,
        duracion_personalizada=duracion_personalizada,
        historial_json=historial_json,
        archivo=archivo,
        forzar_nuevo=forzar_nuevo,
        sesion=sesion,
    )
