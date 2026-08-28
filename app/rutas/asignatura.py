from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from base_datos import obtener_sesion
from app.modelos.asignatura import Asignatura

router = APIRouter()

@router.get("/", response_model=list[Asignatura])
def listar_asignaturas(sesion: Session = Depends(obtener_sesion)):
    statement = select(Asignatura)
    return sesion.exec(statement).all()

@router.post("/", response_model=Asignatura, status_code=status.HTTP_201_CREATED)
def crear_asignatura(asignatura: Asignatura, sesion: Session = Depends(obtener_sesion)):
    sesion.add(asignatura)
    sesion.commit()
    sesion.refresh(asignatura)
    return asignatura