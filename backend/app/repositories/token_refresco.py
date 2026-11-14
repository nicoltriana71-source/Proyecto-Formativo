from datetime import datetime
from typing import Optional

from sqlmodel import Session, select

from backend.app.modelos.token_refresco import TokenRefresco
from backend.app.utilidades.seguridad import ahora_utc


def crear_token_refresco(
    sesion: Session,
    id_usuario: int,
    token_hash: str,
    expira_en: datetime,
) -> TokenRefresco:
    registro = TokenRefresco(
        id_usuario=id_usuario,
        token_hash=token_hash,
        expira_en=expira_en,
    )
    sesion.add(registro)
    sesion.commit()
    sesion.refresh(registro)
    return registro


def obtener_token_refresco(sesion: Session, token_hash: str) -> Optional[TokenRefresco]:
    return sesion.exec(
        select(TokenRefresco).where(TokenRefresco.token_hash == token_hash)
    ).first()


def token_refresco_valido(registro: Optional[TokenRefresco]) -> bool:
    return bool(
        registro
        and not registro.revocado
        and registro.expira_en >= ahora_utc()
    )


def revocar_token_refresco(sesion: Session, token_hash: str) -> bool:
    registro = obtener_token_refresco(sesion, token_hash)
    if not registro:
        return False

    if not registro.revocado:
        registro.revocado = True
        sesion.add(registro)
        sesion.commit()

    return True


def revocar_tokens_usuario(sesion: Session, id_usuario: int) -> None:
    registros = sesion.exec(
        select(TokenRefresco).where(
            TokenRefresco.id_usuario == id_usuario,
            TokenRefresco.revocado == False,  # noqa: E712
        )
    ).all()

    for registro in registros:
        registro.revocado = True
        sesion.add(registro)

    sesion.commit()


def eliminar_tokens_usuario(sesion: Session, id_usuario: int) -> int:
    registros = sesion.exec(
        select(TokenRefresco).where(TokenRefresco.id_usuario == id_usuario)
    ).all()

    for registro in registros:
        sesion.delete(registro)

    sesion.commit()
    return len(registros)


def eliminar_tokens_expirados(sesion: Session) -> int:
    """Limpieza opcional: borra refresh tokens vencidos o revocados."""
    registros = sesion.exec(
        select(TokenRefresco).where(
            (TokenRefresco.expira_en < ahora_utc()) | (TokenRefresco.revocado == True)  # noqa: E712
        )
    ).all()

    for registro in registros:
        sesion.delete(registro)

    sesion.commit()
    return len(registros)
