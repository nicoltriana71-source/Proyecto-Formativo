from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from base_datos import obtener_sesion
from app.modelos.plan_estudio import PlanDeEstudio
from app.modelos.modulo import Modulo
from app.modelos.tema import Tema

router = APIRouter(prefix="/plan-estudio", tags=["Planes de Estudio"])

class PlanAjustarSchema(BaseModel):
    indicaciones: str

@router.get("/", response_model=list[PlanDeEstudio])
def listar_todos_los_planes(sesion: Session = Depends(obtener_sesion)):
    planes = sesion.exec(select(PlanDeEstudio)).all()
    return planes

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

@router.put("/{id_plan}", response_model=PlanDeEstudio)
def actualizar_plan(id_plan: int, datos_plan: PlanDeEstudio, sesion: Session = Depends(obtener_sesion)):
    plan_db = sesion.get(PlanDeEstudio, id_plan)
    if not plan_db:
        raise HTTPException(status_code=404, detail="Plan de estudio no encontrado")
    
    datos_dict = datos_plan.model_dump(exclude_unset=True)
    for key, value in datos_dict.items():
        if key != "id_plan":
            setattr(plan_db, key, value)
            
    sesion.add(plan_db)
    sesion.commit()
    sesion.refresh(plan_db)
    return plan_db

@router.put("/{id_plan}/ajustar")
def ajustar_plan(id_plan: int, datos: PlanAjustarSchema, sesion: Session = Depends(obtener_sesion)):
    plan = sesion.get(PlanDeEstudio, id_plan)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan de estudio no encontrado")
    
    return {
        "mensaje": f"Plan {id_plan} actualizado correctamente según las indicaciones.",
        "indicaciones": datos.indicaciones
    }

@router.delete("/{id_plan}", status_code=status.HTTP_200_OK)
def eliminar_plan(id_plan: int, sesion: Session = Depends(obtener_sesion)):
    plan_db = sesion.get(PlanDeEstudio, id_plan)
    if not plan_db:
        raise HTTPException(status_code=404, detail="Plan de estudio no encontrado")
    
    sesion.delete(plan_db)
    sesion.commit()
    return {"mensaje": f"Plan de estudio con ID {id_plan} eliminado correctamente."}