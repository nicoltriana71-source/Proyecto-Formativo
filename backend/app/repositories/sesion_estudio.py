from sqlmodel import Session, select
from backend.app.modelos.sesion_estudio import SesionEstudio


def listar_todas_las_sesiones(sesion: Session):
    statement = select(SesionEstudio)
    return sesion.exec(statement).all()


def obtener_sesion_por_id(sesion: Session, id_sesion: int):
    return sesion.get(SesionEstudio, id_sesion)


def listar_sesiones_usuario(sesion: Session, id_usuario: int):
    statement = select(SesionEstudio).where(
        SesionEstudio.id_usuario == id_usuario
    )
    return sesion.exec(statement).all()


def registrar_sesion(sesion: Session, datos: dict):
    nueva_sesion = SesionEstudio(**datos)
    sesion.add(nueva_sesion)
    sesion.commit()
    sesion.refresh(nueva_sesion)
    return nueva_sesion


def actualizar_sesion(sesion: Session, sesion_db: SesionEstudio, datos: dict):
    for key, value in datos.items():
        if key != "id_sesion":
            setattr(sesion_db, key, value)

    sesion.add(sesion_db)
    sesion.commit()
    sesion.refresh(sesion_db)
    return sesion_db


def eliminar_sesion(sesion: Session, sesion_db: SesionEstudio):
    sesion.delete(sesion_db)
    sesion.commit()