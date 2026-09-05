# app/rutas/ia.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import uuid
from sqlmodel import Session, select
from base_datos import obtener_sesion
from app.gemini import generar_codigo_ia
from app.modelos.usuario import Usuario
from app.modelos.asignatura import Asignatura
from app.modelos.plan_estudio import PlanDeEstudio
from app.modelos.modulo import Modulo
from app.modelos.tema import Tema
from app.modelos.prompt_ia import PromptIA

router = APIRouter(prefix="/api/ia", tags=["IA Generador"])

# Modelo para los mensajes previos del chat
class MensajeHistorial(BaseModel):
    rol: str   # "usuario" o "ia"
    texto: str

# Modelo de solicitud con memoria de conversación
class SolicitudGeneracion(BaseModel):
    prompt: str
    id_usuario: Optional[int] = None
    historial: Optional[List[MensajeHistorial]] = []

@router.post("/generar")
def generar_interfaz(solicitud: SolicitudGeneracion, sesion: Session = Depends(obtener_sesion)):
    if not solicitud.prompt.strip():
        raise HTTPException(status_code=400, detail="El prompt no puede estar vacío")
    
    try:
        nombre_vista = f"vista_{uuid.uuid4().hex[:8]}"
        
        # Convertir historial de Pydantic a diccionarios
        historial_dicts = [m.model_dump() for m in solicitud.historial]
        
        # Llamar a Gemini enviando el historial de la conversación
        resultado = generar_codigo_ia(
            prompt_usuario=solicitud.prompt,
            historial=historial_dicts,
            nombre_archivo=nombre_vista
        )
        
        # Si se generó un plan, guardarlo en la Base de Datos PostgreSQL
        if resultado.get("tipo") == "plan_generado" and resultado.get("plan"):
            plan_data = resultado["plan"]
            
            # 1. Obtener o crear un usuario por defecto
            usuario_id = solicitud.id_usuario
            if not usuario_id:
                primer_usuario = sesion.exec(select(Usuario)).first()
                if primer_usuario:
                    usuario_id = primer_usuario.id_usuario
                else:
                    nuevo_user = Usuario(
                        nombre="Estudiante StudNova",
                        correo="estudiante@studnova.com",
                        contraseña="123"
                    )
                    sesion.add(nuevo_user)
                    sesion.commit()
                    sesion.refresh(nuevo_user)
                    usuario_id = nuevo_user.id_usuario

            # 2. Obtener o crear asignatura
            nombre_materia = plan_data.get("materia") or "General"
            asignatura_db = sesion.exec(select(Asignatura).where(Asignatura.nombre == nombre_materia)).first()
            if not asignatura_db:
                asignatura_db = Asignatura(
                    nombre=nombre_materia,
                    descripcion=f"Asignatura de {nombre_materia} generada por IA",
                    nivel_dificultad="Personalizado"
                )
                sesion.add(asignatura_db)
                sesion.commit()
                sesion.refresh(asignatura_db)

            # 3. Guardar el Plan de Estudio
            nuevo_plan = PlanDeEstudio(
                id_usuario=usuario_id,
                id_asignatura=asignatura_db.id_asignatura,
                titulo=plan_data.get("titulo") or "Plan de Estudio Personalizado",
                descripcion=plan_data.get("descripcion") or "",
                estado="activo",
                contenido_json=plan_data
            )
            sesion.add(nuevo_plan)
            sesion.commit()
            sesion.refresh(nuevo_plan)

            # 4. Guardar Módulos y Temas
            for idx_m, mod in enumerate(plan_data.get("modulos", [])):
                nuevo_modulo = Modulo(
                    id_plan=nuevo_plan.id_plan,
                    nombre=mod.get("titulo") or f"Módulo {idx_m + 1}",
                    descripcion=mod.get("teoria_modulo") or "",
                    numero_modulo=idx_m + 1,
                    objetivo=mod.get("nivel_tag") or "Objetivo del módulo",
                    estado="activo"
                )
                sesion.add(nuevo_modulo)
                sesion.commit()
                sesion.refresh(nuevo_modulo)

                for idx_t, lec in enumerate(mod.get("lecciones", [])):
                    nuevo_tema = Tema(
                        id_modulo=nuevo_modulo.id_modulo,
                        nombre=lec.get("titulo") or f"Lección {idx_t + 1}",
                        descripcion=lec.get("concepto_teorico") or "",
                        numero_tema=idx_t + 1,
                        duracion_estimada=lec.get("duracion_minutos") or 45
                    )
                    sesion.add(nuevo_tema)

            # 5. Guardar registro en PromptIA
            registro_prompt = PromptIA(
                id_usuario=usuario_id,
                id_plan=nuevo_plan.id_plan,
                prompt_usuario=solicitud.prompt,
                prompt_sistema=resultado.get("mensaje") or "Plan generado",
                modelo_ia="gemini-3.5-flash-lite",
                estado="completado"
            )
            sesion.add(registro_prompt)
            sesion.commit()

            resultado["id_plan"] = nuevo_plan.id_plan
            resultado["id_usuario"] = usuario_id
        
        # Retorna la respuesta real de Gemini (conversación o plan_generado)
        return resultado
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))