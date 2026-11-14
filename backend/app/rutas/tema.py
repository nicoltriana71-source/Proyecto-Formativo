from fastapi import APIRouter, Depends
from sqlmodel import Session
from base_datos import obtener_sesion

from backend.app.esquemas.tema import TemaRespuesta
from backend.app.services import tema as servicio


router = APIRouter(
    prefix="/tema",
    tags=["Temas"]
)


@router.get(
    "/modulo/{id_modulo}",
    response_model=list[TemaRespuesta]
)
def listar_temas_por_modulo(
    id_modulo: int,
    sesion: Session = Depends(obtener_sesion)
):
    return servicio.listar_temas_por_modulo(sesion, id_modulo)


@router.get(
    "/{id_tema}",
    response_model=TemaRespuesta
)
def obtener_detalle_tema(
    id_tema: int,
    sesion: Session = Depends(obtener_sesion)
):
    return servicio.obtener_detalle_tema(sesion, id_tema)