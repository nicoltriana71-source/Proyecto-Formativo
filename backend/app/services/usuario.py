import httpx
from fastapi import HTTPException, status
from sqlmodel import Session

from backend.app.esquemas.usuario import (
    RefreshSolicitud,
    UsuarioActualizar,
    UsuarioCrear,
    UsuarioGoogle,
    UsuarioLogin,
)
from backend.app.repositories.token_refresco import (
    crear_token_refresco,
    eliminar_tokens_usuario,
    obtener_token_refresco,
    revocar_token_refresco,
    revocar_tokens_usuario,
    token_refresco_valido,
)
from backend.app.repositories.usuario import (
    actualizar_usuario as repo_actualizar_usuario,
    autenticar_usuario,
    crear_usuario,
    crear_usuario_google,
    eliminar_usuario as repo_eliminar_usuario,
    obtener_usuario_por_correo,
    obtener_usuario_por_id as repo_obtener_usuario_por_id,
    obtener_usuarios as repo_obtener_usuarios,
)
from backend.app.utilidades.seguridad import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    crear_access_token,
    expiracion_refresh_token,
    generar_refresh_token,
    hash_refresh_token,
)

GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


def _emitir_tokens(usuario, sesion: Session) -> dict:
    """Crea un par de tokens y persiste el refresh token hasheado."""
    refresh = generar_refresh_token()

    crear_token_refresco(
        sesion,
        id_usuario=usuario.id_usuario,
        token_hash=hash_refresh_token(refresh),
        expira_en=expiracion_refresh_token(),
    )

    return {
        "access_token": crear_access_token(usuario.id_usuario, usuario.correo),
        "refresh_token": refresh,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "id_usuario": usuario.id_usuario,
        "nombre": usuario.nombre,
        "correo": usuario.correo,
        "rol": "ESTUDIANTE",
    }


# REGISTRO
def registrar_usuario(datos: UsuarioCrear, sesion: Session) -> dict:
    existente = obtener_usuario_por_correo(sesion, datos.correo)

    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo ya se encuentra registrado.",
        )

    usuario = crear_usuario(sesion, datos)
    return _emitir_tokens(usuario, sesion)


# LOGIN
def login(datos: UsuarioLogin, sesion: Session) -> dict:
    usuario = autenticar_usuario(sesion, datos.correo, datos.contraseña)

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos.",
        )

    return _emitir_tokens(usuario, sesion)


# REFRESH (rotación de tokens)
def refrescar_sesion(datos: RefreshSolicitud, sesion: Session) -> dict:
    token_hash = hash_refresh_token(datos.refresh_token)
    registro = obtener_token_refresco(sesion, token_hash)

    if not token_refresco_valido(registro):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesión expirada. Inicia sesión de nuevo.",
        )

    usuario = repo_obtener_usuario_por_id(sesion, registro.id_usuario)

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no válido.",
        )

    # Rotación: el refresh token usado deja de servir.
    revocar_token_refresco(sesion, token_hash)
    return _emitir_tokens(usuario, sesion)


# LOGOUT
def cerrar_sesion(datos: RefreshSolicitud, sesion: Session) -> dict:
    revocar_token_refresco(sesion, hash_refresh_token(datos.refresh_token))
    return {"mensaje": "Sesión cerrada correctamente."}


# LOGIN / REGISTRO CON GOOGLE
async def login_o_registro_google(
    datos: UsuarioGoogle,
    sesion: Session,
) -> dict:
    """Verifica el access token contra Google y nunca confía en el correo del cliente."""

    try:
        async with httpx.AsyncClient(timeout=10) as cliente:
            respuesta = await cliente.get(
                GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {datos.access_token}"},
            )
    except httpx.HTTPError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No se pudo verificar el token con Google.",
        )

    if respuesta.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de Google inválido o expirado.",
        )

    perfil = respuesta.json()
    correo = (perfil.get("email") or "").lower()

    if not correo or not perfil.get("email_verified"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El correo de Google no está verificado.",
        )

    usuario = obtener_usuario_por_correo(sesion, correo)

    if not usuario:
        usuario = crear_usuario_google(
            sesion,
            nombre=perfil.get("name") or "Estudiante",
            correo=correo,
        )

    return _emitir_tokens(usuario, sesion)


# CONSULTAR TODOS LOS USUARIOS
def obtener_usuarios(sesion: Session):
    return repo_obtener_usuarios(sesion)


# CONSULTAR USUARIO POR ID
def obtener_usuario_por_id(id_usuario: int, sesion: Session):
    usuario = repo_obtener_usuario_por_id(sesion, id_usuario)

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )

    return usuario


# ACTUALIZAR USUARIO
def actualizar_usuario(
    id_usuario: int,
    datos: UsuarioActualizar,
    sesion: Session,
):
    usuario = repo_obtener_usuario_por_id(sesion, id_usuario)

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )

    cambios = datos.model_dump(exclude_unset=True)

    if "correo" in cambios:
        existente = obtener_usuario_por_correo(sesion, cambios["correo"])

        if existente and existente.id_usuario != id_usuario:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo ya está registrado por otro usuario.",
            )

    return repo_actualizar_usuario(sesion, id_usuario, datos)


# ELIMINAR USUARIO
def eliminar_usuario(id_usuario: int, sesion: Session):
    if not repo_obtener_usuario_por_id(sesion, id_usuario):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )

    revocar_tokens_usuario(sesion, id_usuario)
    eliminar_tokens_usuario(sesion, id_usuario)
    eliminado = repo_eliminar_usuario(sesion, id_usuario)

    if not eliminado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )

    return {"mensaje": "Usuario eliminado correctamente."}
