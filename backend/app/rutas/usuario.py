
from typing import List

from fastapi import APIRouter, status

from backend.app.esquemas.usuario import UsuarioRespuesta

from backend.app.services.usuario import (
    registrar_usuario,
    login,
    login_o_registro_google,
    obtener_usuarios,
    obtener_usuario_por_id,
    actualizar_usuario,
    eliminar_usuario
)


router = APIRouter(prefix="/usuario", tags=["Usuarios"])


# REGISTRO
router.add_api_route(
    "/registro",
    registrar_usuario,
    methods=["POST"],
    response_model=UsuarioRespuesta,
    status_code=status.HTTP_201_CREATED
)


# LOGIN
router.add_api_route(
    "/login",
    login,
    methods=["POST"]
)


# GOOGLE
router.add_api_route(
    "/google",
    login_o_registro_google,
    methods=["POST"],
    response_model=UsuarioRespuesta
)


# CONSULTAR TODOS
router.add_api_route(
    "/",
    obtener_usuarios,
    methods=["GET"],
    response_model=List[UsuarioRespuesta]
)


# CONSULTAR POR ID
router.add_api_route(
    "/{id_usuario}",
    obtener_usuario_por_id,
    methods=["GET"],
    response_model=UsuarioRespuesta
)


# ACTUALIZAR
router.add_api_route(
    "/{id_usuario}",
    actualizar_usuario,
    methods=["PUT"],
    response_model=UsuarioRespuesta
)


# ELIMINAR
router.add_api_route(
    "/{id_usuario}",
    eliminar_usuario,
    methods=["DELETE"]
)
