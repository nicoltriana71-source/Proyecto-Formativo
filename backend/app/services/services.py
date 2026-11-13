from fastapi import HTTPException
from sqlmodel import Session
from backend.app.repositories import tema as repositorio


def listar_temas_por_modulo(sesion: Session, id_modulo: int):
    return repositorio.listar_temas_por_modulo(sesion, id_modulo)


def obtener_detalle_tema(sesion: Session, id_tema: int):
    tema = repositorio.obtener_detalle_tema(sesion, id_tema)

    if not tema:
        raise HTTPException(
            status_code=404,
            detail="Tema no encontrado."
        )

    return tema