from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from base_datos import obtener_sesion
from app.esquemas.usuario import UsuarioCrear, UsuarioLogin, UsuarioRespuesta
from app.crud.usuario import obtener_usuario_por_correo, crear_usuario

router = APIRouter()

@router.post("/registro", response_model=UsuarioRespuesta, status_code=status.HTTP_201_CREATED)
def registrar(usuario: UsuarioCrear, sesion: Session = Depends(obtener_sesion)):
    db_user = obtener_usuario_por_correo(sesion, usuario.correo)
    if db_user:
        raise HTTPException(status_code=400, detail="El correo ya está registrado.")
    return crear_usuario(sesion, usuario)

@router.post("/login", response_model=UsuarioRespuesta)
def login(credenciales: UsuarioLogin, sesion: Session = Depends(obtener_sesion)):
    usuario = obtener_usuario_por_correo(sesion, credenciales.correo)
    if not usuario or usuario.contraseña != credenciales.contraseña:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas.")
    return usuario