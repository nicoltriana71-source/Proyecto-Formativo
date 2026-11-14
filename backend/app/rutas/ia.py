from fastapi import APIRouter
from backend.app.services.ia import (
    generar_plan,
    aceptar_plan_sugerido,
    generar_plan_con_archivo
)

router = APIRouter(
    prefix="/api/ia",
    tags=["IA Generador"]
)

# Mapeo de rutas directas (sin crear funciones aquí)
router.add_api_route(
    "/generar",
    generar_plan,
    methods=["POST"],
    summary="Generar plan de estudio con IA"
)

router.add_api_route(
    "/aceptar-sugerencia",
    aceptar_plan_sugerido,
    methods=["POST"],
    summary="Aceptar plan sugerido existente"
)

router.add_api_route(
    "/generar-con-archivo",
    generar_plan_con_archivo,
    methods=["POST"],
    summary="Generar plan de estudio a partir de un documento adjunto"
)