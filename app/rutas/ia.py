# app/rutas/ia.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import uuid
import json
import re
import unicodedata
from sqlmodel import Session, select
from base_datos import obtener_sesion
from app.gemini import generar_codigo_ia, obtener_embedding, calcular_similitud_coseno
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

def normalizar_texto(texto: str) -> str:
    if not texto:
        return ""
    texto = texto.lower().strip()
    texto = unicodedata.normalize('NFKD', texto).encode('ASCII', 'ignore').decode('utf-8')
    return texto

def extraer_palabras_clave(texto: str) -> set:
    t = normalizar_texto(texto)
    stopwords = {
        'hola', 'buenas', 'buenos', 'dias', 'tardes', 'noches', 'que', 'tal', 'como', 'estas',
        'por', 'favor', 'quiero', 'necesito', 'gustaria', 'aprender', 'estudiar', 'saber',
        'crea', 'crear', 'creame', 'generar', 'generame', 'haz', 'hazme', 'dame', 'un', 'una',
        'unos', 'unas', 'el', 'la', 'los', 'las', 'de', 'del', 'en', 'para', 'sobre', 'con',
        'desde', 'cero', 'ed', 'plan', 'estudio', 'estudios', 'ruta', 'aprendizaje', 'curso',
        'tutorial', 'guia', 'temario', 'semana', 'semanas', 'seman', 'semans', 'mes', 'meses',
        'dia', 'dias', 'hora', 'horas', 'modulo', 'modulos', 'moudulo', 'moudulos',
        'nivel', 'basico', 'intermedio', 'avanzado', 'principiante', 'principiantes', 'intensivo'
    }
    palabras = [p for p in re.findall(r'[a-z0-9+#]+', t) if not p.isdigit()]
    return {p for p in palabras if p not in stopwords and len(p) > 1}

def buscar_plan_en_cache(sesion: Session, texto_consulta: str, usuario_id: Optional[int] = None, umbral_similitud: float = 0.88):
    """
    Busca si ya existe un plan de estudio en la BD que coincida semánticamente
    y por materia/palabras clave con la petición del usuario, para evitar llamar a Gemini y ahorrar tokens.
    """
    texto_limpio = texto_consulta.strip()
    if len(texto_limpio) < 3:
        return None

    # Palabras comunes de saludo/conversación básica que no deben disparar caché de plan
    saludos_simples = {"hola", "buenas", "buenos dias", "buenas tardes", "buenas noches", "que tal", "como estas", "ok", "gracias", "si", "no"}
    if normalizar_texto(texto_limpio) in saludos_simples:
        return None

    kw_usuario = extraer_palabras_clave(texto_limpio)
    mejor_plan = None
    max_similitud = 0.0

    # 1. Búsqueda directa por coincidencia de Asignatura registrada en BD
    asignaturas = sesion.exec(select(Asignatura)).all()
    for asig in asignaturas:
        if not asig.nombre or asig.nombre.lower() in ("string", "general", "personalizado", "prueba"):
            continue
        asig_norm = normalizar_texto(asig.nombre)
        asig_kw = extraer_palabras_clave(asig.nombre)
        
        # Si el nombre de la asignatura o alguna palabra clave del tema coincide con la consulta del usuario
        if (asig_norm and asig_norm in normalizar_texto(texto_limpio)) or (asig_kw and bool(asig_kw.intersection(kw_usuario))):
            plan_asig = sesion.exec(
                select(PlanDeEstudio)
                .where(PlanDeEstudio.id_asignatura == asig.id_asignatura)
                .where(PlanDeEstudio.contenido_json != None)
            ).first()
            if plan_asig and plan_asig.contenido_json:
                mejor_plan = plan_asig
                max_similitud = 1.0
                break

    # 2. Si no hubo coincidencia directa de Asignatura, buscar por Embeddings semánticos
    if not mejor_plan:
        emb_actual = obtener_embedding(texto_limpio)
        if emb_actual:
            prompts_previos = sesion.exec(
                select(PromptIA)
                .where(PromptIA.id_plan != None)
                .where(PromptIA.embedding != None)
            ).all()

            for p in prompts_previos:
                try:
                    emb_guardado = json.loads(p.embedding)
                    sim = calcular_similitud_coseno(emb_actual, emb_guardado)
                    if sim >= umbral_similitud and sim > max_similitud:
                        plan_asociado = sesion.get(PlanDeEstudio, p.id_plan)
                        if plan_asociado and plan_asociado.contenido_json:
                            # Validar que las palabras clave del tema coincidan para evitar falsos positivos
                            materia_plan = str(plan_asociado.contenido_json.get("materia", ""))
                            kw_plan = extraer_palabras_clave(f"{plan_asociado.titulo} {materia_plan} {p.prompt_usuario}")
                            
                            # Si el usuario especificó palabras clave de materia, deben tener intersección con el plan
                            if kw_usuario and not (kw_usuario.intersection(kw_plan)):
                                continue

                            mejor_plan = plan_asociado
                            max_similitud = sim
                except Exception as e:
                    print(f"⚠️ Error al leer embedding de prompt {p.id_prompt}: {e}")
                    continue

    # 3. Si encontramos un plan reutilizable, retornarlo
    if mejor_plan and mejor_plan.contenido_json:
        return {
            "tipo": "plan_generado",
            "mensaje": f"⚡ ¡He encontrado un plan de estudio ya preparado sobre {mejor_plan.titulo}!",
            "plan": mejor_plan.contenido_json,
            "id_plan": mejor_plan.id_plan,
            "id_usuario": usuario_id or mejor_plan.id_usuario,
            "desde_cache": True,
            "similitud": round(max_similitud, 3)
        }

    return None


@router.post("/generar")
def generar_interfaz(solicitud: SolicitudGeneracion, sesion: Session = Depends(obtener_sesion)):
    if not solicitud.prompt.strip():
        raise HTTPException(status_code=400, detail="El prompt no puede estar vacío")
    
    try:
        # Obtener o asignar usuario por defecto
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

        # -------------------------------------------------------------
        # 1. VERIFICAR CACHÉ SEMÁNTICO EN BASE DE DATOS (0 TOKENS)
        # -------------------------------------------------------------
        kw_actual = extraer_palabras_clave(solicitud.prompt)
        plan_cache = None

        if kw_actual:
            # Si el usuario menciona un tema concreto (ej: "Inglés Técnico", "Mecánica"),
            # buscamos ÚNICAMENTE su petición actual para no contaminar con temas viejos
            plan_cache = buscar_plan_en_cache(sesion, solicitud.prompt, usuario_id=usuario_id)
        else:
            # Solo si el mensaje actual es una confirmación corta ("sí", "2 semanas", "hazlo"),
            # buscamos el tema más reciente en el historial
            for msg in reversed(solicitud.historial):
                if msg.rol == "usuario":
                    kw_prev = extraer_palabras_clave(msg.texto)
                    if kw_prev:
                        plan_cache = buscar_plan_en_cache(sesion, f"{msg.texto} {solicitud.prompt}", usuario_id=usuario_id)
                        break

        if plan_cache:
            print(f"🎯 [CACHÉ SEMÁNTICO] Plan reutilizado (Similitud: {plan_cache.get('similitud')}) - 0 tokens usados.")
            return plan_cache

        # -------------------------------------------------------------
        # 2. SI NO ESTÁ EN CACHÉ: LLAMAR A GEMINI
        # -------------------------------------------------------------
        nombre_vista = f"vista_{uuid.uuid4().hex[:8]}"
        historial_dicts = [m.model_dump() for m in solicitud.historial]
        
        resultado = generar_codigo_ia(
            prompt_usuario=solicitud.prompt,
            historial=historial_dicts,
            nombre_archivo=nombre_vista
        )
        
        # Si Gemini generó un nuevo plan, guardarlo en PostgreSQL y guardar su embedding
        if resultado.get("tipo") == "plan_generado" and resultado.get("plan"):
            plan_data = resultado["plan"]

            # Obtener o crear asignatura
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

            # Guardar el nuevo Plan de Estudio
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

            # Guardar Módulos y Temas
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

            # Generar embedding del prompt para que quede disponible en el caché semántico futuro
            texto_para_embedding = f"{solicitud.prompt} {nombre_materia} {nuevo_plan.titulo}"
            vector_embedding = obtener_embedding(texto_para_embedding)

            # Guardar registro en PromptIA con su vector embedding
            registro_prompt = PromptIA(
                id_usuario=usuario_id,
                id_plan=nuevo_plan.id_plan,
                prompt_usuario=solicitud.prompt,
                prompt_sistema=resultado.get("mensaje") or "Plan generado",
                modelo_ia="gemini-3.5-flash-lite",
                embedding=json.dumps(vector_embedding) if vector_embedding else None,
                estado="completado"
            )
            sesion.add(registro_prompt)
            sesion.commit()

            resultado["id_plan"] = nuevo_plan.id_plan
            resultado["id_usuario"] = usuario_id
            resultado["desde_cache"] = False
        
        return resultado
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
