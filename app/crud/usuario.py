from sqlmodel import Session, select
from app.modelos.usuario import Usuario
from app.esquemas.usuario import UsuarioCrear

def obtener_usuario_por_correo(sesion: Session, correo: str) -> Usuario | None:
    statement = select(Usuario).where(Usuario.correo == correo)
    return sesion.exec(statement).first()

def crear_usuario(sesion: Session, usuario: UsuarioCrear) -> Usuario:
    # Nota: En producción recuerda encriptar la contraseña (ej. con passlib/bcrypt)
    db_usuario = Usuario(
        nombre=usuario.nombre,
        correo=usuario.correo,
        contraseña=usuario.contraseña
    )
    sesion.add(db_usuario)
    sesion.commit()
    sesion.refresh(db_usuario)
    return db_usuario