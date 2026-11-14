"""Capa de infraestructura de seguridad.

Responsabilidades:
- Hash y verificación de contraseñas (bcrypt).
- Emisión y validación de access tokens (JWT).
- Generación y hash de refresh tokens (opacos, guardados en BD).
"""

import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Optional

import bcrypt
from dotenv import load_dotenv
from jose import JWTError, jwt

# Cargar .env de la raíz del proyecto aunque este módulo se importe primero.
BASE_DIR = Path(__file__).resolve().parents[3]
load_dotenv(BASE_DIR / ".env")

ALGORITHM = "HS256"
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "").strip()
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

if not JWT_SECRET_KEY:
    raise RuntimeError(
        "Falta JWT_SECRET_KEY en el .env. Genera una con: "
        'python -c "import secrets; print(secrets.token_urlsafe(64))"'
    )


def ahora_utc() -> datetime:
    """Fecha UTC naive, consistente con las columnas TIMESTAMP de PostgreSQL."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def hash_password(password: str) -> str:
    # bcrypt solo procesa los primeros 72 bytes.
    return bcrypt.hashpw(password.encode("utf-8")[:72], bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(
            password.encode("utf-8")[:72],
            password_hash.encode("utf-8"),
        )
    except (ValueError, TypeError):
        return False


def crear_access_token(id_usuario: int, correo: str, rol: str = "ESTUDIANTE") -> str:
    ahora = datetime.now(timezone.utc)
    payload = {
        "sub": str(id_usuario),
        "correo": correo,
        "rol": rol,
        "type": "access",
        "iat": ahora,
        "exp": ahora + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        "jti": secrets.token_hex(8),
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=ALGORITHM)


def decodificar_access_token(token: str) -> Optional[dict[str, Any]]:
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

    if payload.get("type") != "access":
        return None

    return payload


def generar_refresh_token() -> str:
    return secrets.token_urlsafe(64)


def hash_refresh_token(token: str) -> str:
    """El refresh token se guarda hasheado: si filtran la BD, no sirve para entrar."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def expiracion_refresh_token() -> datetime:
    return ahora_utc() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
