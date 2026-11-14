from sqlmodel import Session, select
from backend.app.modelos.tema import Tema


def listar_temas_por_modulo(sesion: Session, id_modulo: int):
    statement = select(Tema).where(
        Tema.id_modulo == id_modulo
    )

    return sesion.exec(statement).all()


def obtener_detalle_tema(sesion: Session, id_tema: int):
    return sesion.get(Tema, id_tema)