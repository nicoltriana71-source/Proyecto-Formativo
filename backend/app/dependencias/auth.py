from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session

from base_datos import obtener_sesion
from backend.app.modelos.usuario import Usuario
from backend.app.repositories.usuario import obtener_usuario_por_id
from backend.app.utilidades.seguridad import decodificar_access_token

esquema_bearer = HTTPBearer(auto_error=False)


def _no_autorizado(detalle: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detalle,
        headers={"WWW-Authenticate": "Bearer"},
    )


def obtener_usuario_actual(
    credenciales: HTTPAuthorizationCredentials | None = Depends(esquema_bearer),
    sesion: Session = Depends(obtener_sesion),
) -> Usuario:
    """Extrae el usuario del JWT. El cliente nunca decide quién es."""
    if not credenciales or credenciales.scheme.lower() != "bearer":
        raise _no_autorizado("Token de acceso requerido.")

    payload = decodificar_access_token(credenciales.credentials)
    if not payload:
        raise _no_autorizado("Token inválido o expirado.")

    try:
        id_usuario = int(payload["sub"])
    except (KeyError, TypeError, ValueError):
        raise _no_autorizado("Token inválido.")

    usuario = obtener_usuario_por_id(sesion, id_usuario)
    if not usuario:
        raise _no_autorizado("Usuario no encontrado.")

    return usuario


def verificar_propietario(
    id_propietario: int | None,
    usuario_actual: Usuario,
    recurso: str = "recurso",
) -> None:
    """Lanza 403 si el recurso no pertenece al usuario autenticado."""
    if id_propietario != usuario_actual.id_usuario:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"No tienes permiso para acceder a este {recurso}.",
        )
