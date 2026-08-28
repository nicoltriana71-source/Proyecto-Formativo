from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from base_datos import obtener_sesion
from app.modelos.plan_estudio import PlanDeEstudio
from app.modelos.modulo import Modulo
from app.modelos.tema import Tema

router = APIRouter()

@router.get("/usuario/{id_usuario}", response_model=list[PlanDeEstudio])
def obtener_planes_usuario(id_usuario: int, sesion: Session = Depends(obtener_sesion)):
    statement = select(PlanDeEstudio).where(PlanDeEstudio.id_usuario == id_usuario)
    return sesion.exec(statement).all()

@router.get("/{id_plan}")
def obtener_detalle_plan(id_plan: int, sesion: Session = Depends(obtener_sesion)):
    plan = sesion.get(PlanDeEstudio, id_plan)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan de estudio no encontrado")
    
    modulos = sesion.exec(select(Modulo).where(Modulo.id_plan == id_plan)).all()
    
    estructura = []
    for mod in modulos:
        temas = sesion.exec(select(Tema).where(Tema.id_modulo == mod.id_modulo)).all()
        estructura.append({
            "modulo": mod,
            "temas": temas
        })
        
    return {
        "plan": plan,
        "contenido": estructura
    }

@router.post("/", response_model=PlanDeEstudio, status_code=status.HTTP_201_CREATED)
def crear_plan(plan: PlanDeEstudio, sesion: Session = Depends(obtener_sesion)):
    sesion.add(plan)
    sesion.commit()
    sesion.refresh(plan)
    return plan