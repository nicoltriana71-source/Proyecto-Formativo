// ==========================================
// CONFIGURACIÓN Y ESTADO GLOBAL
// ==========================================
const API_BASE = (window.location.port === "8000" || window.location.port === "") ? "" : "http://127.0.0.1:8000";

const chatBox = document.getElementById('chat-box');
const promptInput = document.getElementById('prompt-input');
const btnEnviar = document.getElementById('btn-enviar');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const historyList = document.getElementById('history-list');

let historialConversacion = [];
let listaMensajesUI = [];
window.ultimoPlanGenerado = null;

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    await asegurarUsuarioRegistrado();
    cargarHistorialPlanes();
    restaurarEstadoChat();
});

// Sincronizar automáticamente usuarios autenticados por Google
async function asegurarUsuarioRegistrado() {
    try {
        const idActual = localStorage.getItem("id_usuario");
        let email = localStorage.getItem("userEmail");
        let nombre = localStorage.getItem("userName");

        if (!email) {
            const userRaw = localStorage.getItem("user");
            if (userRaw) {
                const uObj = JSON.parse(userRaw);
                email = uObj.email || uObj.correo;
                nombre = uObj.name || uObj.nombre;
            }
        }

        if (email && (!idActual || idActual === "13" || isNaN(parseInt(idActual)))) {
            const res = await fetch(`${API_BASE}/usuario/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: nombre || "Estudiante",
                    correo: email
                })
            });
            if (res.ok) {
                const u = await res.json();
                localStorage.setItem("id_usuario", u.id_usuario);
                localStorage.setItem("user", JSON.stringify(u));
                console.log("Usuario de Google sincronizado con PostgreSQL:", u.id_usuario);
            }
        }
    } catch (e) {
        console.warn("Aviso al verificar usuario:", e);
    }
}

// ==========================================
// UTILIDAD: OBTENER ID USUARIO
// ==========================================
function obtenerIdUsuario() {
    try {
        const idDirecto = localStorage.getItem("id_usuario") || sessionStorage.getItem("id_usuario");
        if (idDirecto) return parseInt(idDirecto);

        const usuarioStr = localStorage.getItem("user") || localStorage.getItem("usuario") || localStorage.getItem("studnova:session") || sessionStorage.getItem("usuario");
        if (usuarioStr) {
            const u = JSON.parse(usuarioStr);
            return u.id_usuario || u.id || 1;
        }
    } catch (e) {
        console.warn("No se pudo parsear la información de usuario:", e);
    }
    return 1;
}

// ==========================================
// CERRAR SESIÓN
// ==========================================
function cerrarSesion() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "../principal interfaz/index.html";
}

// ==========================================
// CONTROL DEL MENÚ HAMBURGUESA / SIDEBAR
// ==========================================
function toggleMenu() {
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
}

// ==========================================
// CARGAR HISTORIAL DE PLANES (BASE DE DATOS)
// ==========================================
async function cargarHistorialPlanes() {
    if (!historyList) return;

    const idUsuario = obtenerIdUsuario();

    try {
        const respuesta = await fetch(`${API_BASE}/plan-estudio/usuario/${idUsuario}`);
        if (!respuesta.ok) {
            throw new Error("No se pudo obtener el historial de planes.");
        }

        const planes = await respuesta.json();
        historyList.innerHTML = '';

        if (!planes || planes.length === 0) {
            historyList.innerHTML = '<li class="sin-planes">No hay planes creados aún.</li>';
            return;
        }

        planes.forEach(plan => {
            const li = document.createElement('li');
            li.className = 'history-item';

            const fechaFormateada = plan.fecha_creacion 
                ? new Date(plan.fecha_creacion).toLocaleDateString() 
                : (plan.fecha || 'Reciente');

            const contenidoPlan = plan.contenido_json 
                ? (typeof plan.contenido_json === 'string' ? JSON.parse(plan.contenido_json) : plan.contenido_json) 
                : plan;

            li.onclick = () => cargarPlanSeleccionado(contenidoPlan);
            li.innerHTML = `
                <span class="plan-title">${escaparHTML(plan.titulo || plan.nombre || "Plan de Estudio")}</span>
                <span class="plan-date">${escaparHTML(plan.nivel_objetivo || "Intermedio")} • ${fechaFormateada}</span>
            `;
            historyList.appendChild(li);
        });

    } catch (error) {
        console.warn("Aviso al cargar historial de planes:", error);
        historyList.innerHTML = '<li class="sin-planes">No hay planes creados aún.</li>';
    }
}

function cargarPlanSeleccionado(plan) {
    if (!plan) return;
    localStorage.setItem("plan_estudio_actual", JSON.stringify(plan));
    window.location.href = '/principal/interfaz plan de estudio/visor_plan.html';
}

// ==========================================
// GESTIÓN DE ARCHIVOS ADJUNTOS Y CONFIGURACIÓN
// ==========================================
let archivoAdjuntoActual = null;

function activarInputArchivo() {
    const input = document.getElementById('input-archivo');
    if (input) input.click();
}

function manejarArchivoSeleccionado(evento) {
    const file = evento.target.files && evento.target.files[0];
    if (!file) return;

    archivoAdjuntoActual = file;
    const contenedor = document.getElementById('contenedor-adjunto');
    const txtNombre = document.getElementById('nombre-archivo-adjunto');
    const btnClip = document.getElementById('btn-adjuntar');

    if (txtNombre) txtNombre.innerText = file.name;
    if (contenedor) contenedor.style.display = 'flex';
    if (btnClip) btnClip.classList.add('activo');
}

function quitarArchivoAdjunto() {
    archivoAdjuntoActual = null;
    const input = document.getElementById('input-archivo');
    if (input) input.value = '';

    const selModulos = document.getElementById('select-modulos');
    if (selModulos) selModulos.value = '';

    const selDuracion = document.getElementById('select-duracion');
    if (selDuracion) selDuracion.value = '';

    const contenedor = document.getElementById('contenedor-adjunto');
    const btnClip = document.getElementById('btn-adjuntar');

    if (contenedor) contenedor.style.display = 'none';
    if (btnClip) btnClip.classList.remove('activo');
}

// ==========================================
// ENVÍO DE MENSAJES Y CHAT
// ==========================================
function manejarEnter(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        enviarMensaje();
    }
}

async function enviarMensaje(forzarNuevo = false, promptPersonalizado = null, cantModulosParam = null, duracionParam = null) {
    const input = document.getElementById('prompt-input') || promptInput;
    const boton = document.getElementById('btn-enviar') || btnEnviar;
    const texto = promptPersonalizado !== null ? promptPersonalizado.trim() : (input ? input.value.trim() : '');

    if (!texto && !archivoAdjuntoActual) return;

    const idUsuario = obtenerIdUsuario();

    // Obtener parámetros de módulos y duración
    const hayAdjunto = Boolean(archivoAdjuntoActual);
    const selModulos = document.getElementById('select-modulos');
    const selDuracion = document.getElementById('select-duracion');

    const cantModulos = cantModulosParam || ((hayAdjunto && selModulos && selModulos.value) ? Number(selModulos.value) : null);
    const duracionDeseada = duracionParam || ((hayAdjunto && selDuracion && selDuracion.value) ? selDuracion.value : null);

    // Etiqueta visual para el mensaje del usuario en el chat
    let textoAMostrar = texto;
    if (forzarNuevo && promptPersonalizado) {
        let detalle = [];
        if (cantModulos) detalle.push(`${cantModulos} módulos`);
        if (duracionDeseada) detalle.push(`en ${duracionDeseada}`);
        const strDetalle = detalle.length > 0 ? ` (${detalle.join(', ')})` : '';
        textoAMostrar = `✨ Prefiero generar un plan nuevo desde cero${strDetalle}: "${texto}"`;
    } else if (hayAdjunto) {
        let detalleExtra = [];
        if (cantModulos) detalleExtra.push(`${cantModulos} módulos`);
        if (duracionDeseada) detalleExtra.push(duracionDeseada);
        const strDetalle = detalleExtra.length > 0 ? ` (${detalleExtra.join(', ')})` : '';

        const mensajeBase = texto || "Crea un plan de estudio a partir de este documento adjunto.";
        textoAMostrar = `📄 [Adjunto: ${archivoAdjuntoActual.name}${strDetalle}]\n${mensajeBase}`;
    }

    historialConversacion.push({ rol: "usuario", texto: textoAMostrar });
    agregarMensajeUsuario(textoAMostrar);

    if (input && !promptPersonalizado) input.value = '';
    if (boton) {
        boton.disabled = true;
        boton.style.opacity = '0.5';
    }

    const idCarga = agregarMensajeCarga();
    scrollAlFondo();

    try {
        let respuesta;

        // Si hay archivo adjunto real, usar el endpoint multipart
        if (hayAdjunto) {
            const formData = new FormData();
            formData.append('prompt', texto || "Genera un plan de estudio pedagógico a partir de este documento.");
            formData.append('id_usuario', Number(idUsuario));
            if (cantModulos) formData.append('cantidad_modulos', cantModulos);
            if (duracionDeseada) formData.append('duracion_personalizada', duracionDeseada);
            formData.append('historial_json', JSON.stringify(historialConversacion.slice(0, -1)));
            formData.append('archivo', archivoAdjuntoActual);

            respuesta = await fetch(`${API_BASE}/api/ia/generar-con-archivo`, {
                method: 'POST',
                body: formData
            });
        } else {
            // Flujo estándar conversacional JSON con parámetros específicos
            let promptFinal = texto;
            if (forzarNuevo) {
                promptFinal = `Genera directamente el plan de estudio estructurado completo en JSON sobre: ${texto}.`;
                if (cantModulos) promptFinal += ` Requisito obligatorio: DEBE contener exactamente ${cantModulos} módulos completos.`;
                if (duracionDeseada) promptFinal += ` Diseñado para completarse en un tiempo de: ${duracionDeseada}.`;
            }

            respuesta = await fetch(`${API_BASE}/api/ia/generar`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    prompt: promptFinal,
                    historial: historialConversacion,
                    id_usuario: Number(idUsuario),
                    forzar_nuevo: Boolean(forzarNuevo),
                    cantidad_modulos: cantModulos ? Number(cantModulos) : null,
                    duracion_personalizada: duracionDeseada || null
                })
            });
        }

        let datos;
        const textoRespuesta = await respuesta.text();

        try {
            datos = JSON.parse(textoRespuesta);
        } catch {
            throw new Error(textoRespuesta || 'Error en la respuesta del servidor');
        }

        if (!respuesta.ok) {
            throw new Error(datos.detail || 'Ocurrió un error al procesar la solicitud');
        }

        removerElemento(idCarga);

        // CASO 1: Sugerencia de plan existente
        if (datos.tipo === "sugerencia_plan_existente") {
            const textoIA = datos.mensaje || "He encontrado un plan existente similar a tu solicitud.";
            historialConversacion.push({ rol: "ia", texto: textoIA });
            agregarMensajeSugerenciaPlan(datos);
            return;
        }

        const textoIA = datos.mensaje || datos.respuesta || "He procesado tu solicitud.";
        historialConversacion.push({ rol: "ia", texto: textoIA });

        const tienePlan = (datos.tipo === "plan_generado") || 
                          (datos.plan && datos.plan.modulos && datos.plan.modulos.length > 0) || 
                          (datos.modulos && datos.modulos.length > 0);

        if (tienePlan) {
            const planObjeto = datos.plan || datos;
            window.ultimoPlanGenerado = planObjeto;

            // Guardar plan actual en LocalStorage y refrescar panel de historial
            localStorage.setItem("plan_estudio_actual", JSON.stringify(planObjeto));
            cargarHistorialPlanes();

            agregarMensajeIARespuestaPlan(datos, planObjeto);
        } else {
            agregarMensajeIATexto(textoIA);
        }

        // Limpiar archivo adjunto tras envío exitoso
        quitarArchivoAdjunto();

    } catch (error) {
        removerElemento(idCarga);
        agregarMensajeError(error.message);
    } finally {
        if (boton) {
            boton.disabled = false;
            boton.style.opacity = '1';
        }
        if (input) input.focus();
        guardarEstadoChat();
        scrollAlFondo();
    }
}

// ==========================================
// PERSISTENCIA DEL ESTADO DEL CHAT
// ==========================================
function guardarEstadoChat() {
    try {
        const idUsuario = obtenerIdUsuario();
        localStorage.setItem(`studnova_chat_historial_${idUsuario}`, JSON.stringify(historialConversacion));
        localStorage.setItem(`studnova_chat_mensajes_ui_${idUsuario}`, JSON.stringify(listaMensajesUI));
        if (window.ultimoPlanGenerado) {
            localStorage.setItem(`studnova_ultimo_plan_${idUsuario}`, JSON.stringify(window.ultimoPlanGenerado));
        }
    } catch (e) {
        console.warn("Aviso al guardar estado del chat:", e);
    }
}

function restaurarEstadoChat() {
    try {
        const idUsuario = obtenerIdUsuario();
        const rawHistorial = localStorage.getItem(`studnova_chat_historial_${idUsuario}`);
        const rawMensajesUI = localStorage.getItem(`studnova_chat_mensajes_ui_${idUsuario}`);
        const rawUltimoPlan = localStorage.getItem(`studnova_ultimo_plan_${idUsuario}`);

        if (rawHistorial) {
            historialConversacion = JSON.parse(rawHistorial);
        }
        if (rawUltimoPlan) {
            window.ultimoPlanGenerado = JSON.parse(rawUltimoPlan);
        }

        if (rawMensajesUI) {
            listaMensajesUI = JSON.parse(rawMensajesUI);
            if (Array.isArray(listaMensajesUI) && listaMensajesUI.length > 0) {
                listaMensajesUI.forEach(item => {
                    if (item.tipo === 'usuario') {
                        renderizarDOMMensajeUsuario(item.texto);
                    } else if (item.tipo === 'ia_texto') {
                        renderizarDOMMensajeIATexto(item.texto);
                    } else if (item.tipo === 'ia_plan') {
                        renderizarDOMMensajeIAPlan(item.datos, item.planObjeto);
                    } else if (item.tipo === 'ia_sugerencia') {
                        renderizarDOMMensajeSugerencia(item.datos);
                    } else if (item.tipo === 'error') {
                        renderizarDOMMensajeError(item.texto);
                    }
                });
                scrollAlFondo();
            }
        }
    } catch (e) {
        console.warn("Aviso al restaurar estado del chat:", e);
    }
}

function iniciarNuevoChat() {
    if (listaMensajesUI.length > 0 && !confirm("¿Deseas iniciar una nueva conversación? Se limpiará el chat actual.")) {
        return;
    }
    const idUsuario = obtenerIdUsuario();
    localStorage.removeItem(`studnova_chat_historial_${idUsuario}`);
    localStorage.removeItem(`studnova_chat_mensajes_ui_${idUsuario}`);
    localStorage.removeItem(`studnova_ultimo_plan_${idUsuario}`);
    historialConversacion = [];
    listaMensajesUI = [];
    window.ultimoPlanGenerado = null;

    if (chatBox) {
        chatBox.innerHTML = `
            <div class="mensaje">
                <div class="avatar">
                    <img src="/login/image.png" alt="Logo" width="50" height="50" class="logo" style="border-radius:50%; object-fit:cover;">
                </div>
                <div class="contenido">
                    <p>¡Hola! 👋 Soy tu asistente de <strong>StudNova IA</strong>.</p>
                    <p style="margin-top: 8px;">Cuéntame, ¿qué materia o tema te gustaría aprender hoy?</p>
                </div>
            </div>
        `;
    }
    quitarArchivoAdjunto();
    if (sidebar && sidebar.classList.contains('active')) {
        toggleMenu();
    }
}
// ==========================================
// INICIAR NUEVO CHAT (SIN CONFIRMACIÓN)
// ==========================================
function iniciarNuevoChat() {
    const idUsuario = obtenerIdUsuario();
    localStorage.removeItem(`studnova_chat_historial_${idUsuario}`);
    localStorage.removeItem(`studnova_chat_mensajes_ui_${idUsuario}`);
    localStorage.removeItem(`studnova_ultimo_plan_${idUsuario}`);
    historialConversacion = [];
    listaMensajesUI = [];
    window.ultimoPlanGenerado = null;

    if (chatBox) {
        chatBox.innerHTML = `
            <div class="mensaje">
                <div class="avatar">
                    <img src="/login/image.png" alt="Logo" width="50" height="50" class="logo" style="border-radius:50%; object-fit:cover;">
                </div>
                <div class="contenido">
                    <p>¡Hola! 👋 Soy tu asistente de <strong>StudNova IA</strong>.</p>
                    <p style="margin-top: 8px;">Cuéntame, ¿qué materia o tema te gustaría aprender hoy?</p>
                </div>
            </div>
        `;
    }
    quitarArchivoAdjunto();
    if (sidebar && sidebar.classList.contains('active')) {
        toggleMenu();
    }
}

// ==========================================
// RENDERIZADO DE MENSAJES EN EL CHAT (DOM)
// ==========================================
function renderizarDOMMensajeUsuario(texto) {
    const div = document.createElement('div');
    div.className = 'mensaje';
    div.style.flexDirection = 'row-reverse';
    div.innerHTML = `
        <div class="avatar" style="background:#1e293b; display:flex; justify-content:center; align-items:center;">👩🏻‍💻</div>
        <div class="contenido" style="background:#1e293b;"><p>${escaparHTML(texto)}</p></div>
    `;
    chatBox.appendChild(div);
}

function agregarMensajeUsuario(texto) {
    renderizarDOMMensajeUsuario(texto);
    listaMensajesUI.push({ tipo: 'usuario', texto });
    guardarEstadoChat();
}

function agregarMensajeCarga() {
    const id = 'carga-' + Date.now();
    const div = document.createElement('div');
    div.className = 'mensaje';
    div.id = id;
    div.innerHTML = `
<<<<<<< HEAD
        <div class="avatar"><img src="avatar.png" alt="Avatar IA" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"></div>
        <div class="contenido"><p>⏳ <em>StudNova IA está respondiendo...</em></p></div>
=======
        <div class="avatar">🤖</div>
        <div class="contenido"><p>⏳ <em>StudNova IA está estructurando tu plan personalizado...</em></p></div>
>>>>>>> b6f7aedd54a65a08a30c18ec235c5774291a64b5
    `;
    chatBox.appendChild(div);
    return id;
}

function renderizarDOMMensajeIATexto(texto) {
    const div = document.createElement('div');
    div.className = 'mensaje';
    div.innerHTML = `
        <div class="avatar"><img src="avatar.png" alt="Avatar IA" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"></div>
        <div class="contenido"><p>${escaparHTML(texto)}</p></div>
    `;
    chatBox.appendChild(div);
}

function agregarMensajeIATexto(texto) {
    renderizarDOMMensajeIATexto(texto);
    listaMensajesUI.push({ tipo: 'ia_texto', texto });
    guardarEstadoChat();
}

// ==========================================
// SUGERENCIA INTERACTIVA DE PLAN EXISTENTE
// ==========================================
window.planesSugeridos = window.planesSugeridos || {};

function renderizarDOMMensajeSugerencia(datos) {
    const div = document.createElement('div');
    div.className = 'mensaje';

    const plan = datos.plan_sugerido || {};
    const idPlan = datos.id_plan;
    window.planesSugeridos[idPlan] = plan;

    const titulo = plan.titulo || "Plan de Estudio";
    const descripcion = plan.descripcion || "Ruta estructurada de aprendizaje interactivo.";
    const modulosCount = (plan.modulos && Array.isArray(plan.modulos)) ? plan.modulos.length : 3;
    const materia = plan.materia || "Materia Principal";
    const idCard = `sugerencia-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const temaOriginal = datos.prompt_original || materia;

    div.innerHTML = `
        <div class="avatar"><img src="avatar.png" alt="Avatar IA" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"></div>
        <div class="contenido" style="width: 85%;">
            <div class="tarjeta-sugerencia" id="${idCard}">
                <div class="sugerencia-badge">💡 Plan similar encontrado en biblioteca</div>
                <div class="sugerencia-titulo">${escaparHTML(titulo)}</div>
                <div class="sugerencia-desc">${escaparHTML(descripcion)}</div>
                
                <div class="sugerencia-meta">
                    <span class="meta-item">📖 ${modulosCount} módulos</span>
                    <span class="meta-item">🏷️ ${escaparHTML(materia)}</span>
                    <span class="meta-item ahorro">⚡ 0 tokens requeridos (Carga instantánea)</span>
                </div>

                <p style="font-size: 0.9rem; color: #f1f5f9; margin-bottom: 12px; font-weight: 500;">
                    Ya existe este plan estructurado que cubre tu consulta. ¿Qué deseas hacer?
                </p>

                <div class="sugerencia-acciones" id="acciones-${idCard}">
                    <button type="button" class="btn-sugerencia btn-sugerencia-aceptar" onclick="aceptarPlanSugerido(${idPlan}, '${idCard}')">
                        📖 1. Ver este plan existente
                    </button>
                    <button type="button" class="btn-sugerencia btn-sugerencia-nuevo" onclick="mostrarPreguntasNuevoPlan('${escaparHTML(temaOriginal)}', '${idCard}')">
                        ✨ 2. Generar un plan nuevo con IA
                    </button>
                </div>
            </div>
        </div>
    `;

    chatBox.appendChild(div);
}

function agregarMensajeSugerenciaPlan(datos) {
    renderizarDOMMensajeSugerencia(datos);
    listaMensajesUI.push({ tipo: 'ia_sugerencia', datos });
    guardarEstadoChat();
    scrollAlFondo();
}

async function aceptarPlanSugerido(idPlan, idCard) {
    const contenedorCard = document.getElementById(idCard);
    if (contenedorCard) {
        const botones = contenedorCard.querySelectorAll('button');
        botones.forEach(b => {
            b.disabled = true;
            b.style.opacity = '0.5';
        });
    }

    const idCarga = agregarMensajeCarga();
    scrollAlFondo();

    try {
        const idUsuario = obtenerIdUsuario();
        const res = await fetch(`${API_BASE}/api/ia/aceptar-sugerencia`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                id_plan: Number(idPlan),
                id_usuario: Number(idUsuario)
            })
        });

        removerElemento(idCarga);

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.detail || "Error al cargar el plan existente");
        }

        const datos = await res.json();
        const planObjeto = datos.plan || window.planesSugeridos[idPlan];

        window.ultimoPlanGenerado = planObjeto;
        localStorage.setItem("plan_estudio_actual", JSON.stringify(planObjeto));
        cargarHistorialPlanes();

        if (contenedorCard) {
            contenedorCard.style.borderColor = '#10b981';
            const acciones = contenedorCard.querySelector('.sugerencia-acciones');
            if (acciones) {
                acciones.innerHTML = '<span style="color: #34d399; font-size: 0.85rem; font-weight: bold;">✔️ Has seleccionado ver este plan existente</span>';
            }
        }

        agregarMensajeIARespuestaPlan(datos, planObjeto);

    } catch (e) {
        removerElemento(idCarga);
        agregarMensajeError(e.message);
    }
}

// ==========================================
// PREGUNTAS INTERACTIVAS PARA NUEVO PLAN
// ==========================================
function mostrarPreguntasNuevoPlan(temaOriginal, idCard) {
    const contenedorAcciones = document.getElementById(`acciones-${idCard}`);
    if (!contenedorAcciones) return;

    contenedorAcciones.innerHTML = `
        <div class="formulario-preguntas-nuevo" style="background:#0f172a; padding:12px; border-radius:8px; border:1px solid #334155; margin-top:8px;">
            <p style="font-size:0.9rem; color:#72AFC1; font-weight:bold; margin-bottom:8px;">
                🎯 Personaliza tu nuevo plan sobre "${escaparHTML(temaOriginal)}":
            </p>

            <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:10px;">
                <div style="flex:1; min-width:130px;">
                    <label style="font-size:0.75rem; color:#94a3b8; display:block; margin-bottom:4px; font-weight:600;">
                        ⏱️ ¿En cuánto tiempo?
                    </label>
                    <select id="tiempo-${idCard}" style="width:100%; padding:6px; background:#1e293b; color:#f8fafc; border:1px solid #475569; border-radius:6px; font-size:0.85rem;">
                        <option value="1 semana">1 semana (Intensivo)</option>
                        <option value="2 semanas" selected>2 semanas (Recomendado)</option>
                        <option value="1 mes">1 mes (Paso a paso)</option>
                        <option value="2 meses">2 meses (A profundidad)</option>
                    </select>
                </div>

                <div style="flex:1; min-width:130px;">
                    <label style="font-size:0.75rem; color:#94a3b8; display:block; margin-bottom:4px; font-weight:600;">
                        📚 ¿Cuántos módulos?
                    </label>
                    <select id="modulos-${idCard}" style="width:100%; padding:6px; background:#1e293b; color:#f8fafc; border:1px solid #475569; border-radius:6px; font-size:0.85rem;">
                        <option value="3">3 módulos (Esencial)</option>
                        <option value="4" selected>4 módulos (Equilibrado)</option>
                        <option value="5">5 módulos (Completo)</option>
                    </select>
                </div>
            </div>

            <button type="button" class="btn-sugerencia btn-sugerencia-nuevo" onclick="confirmarNuevoPlanPersonalizado('${escaparHTML(temaOriginal)}', '${idCard}')" style="width:100%; justify-content:center; padding:8px;">
                🚀 ¡Generar mi plan personalizado!
            </button>
        </div>
    `;

    scrollAlFondo();
}

function confirmarNuevoPlanPersonalizado(temaOriginal, idCard) {
    const selTiempo = document.getElementById(`tiempo-${idCard}`);
    const selModulos = document.getElementById(`modulos-${idCard}`);

    const tiempoSeleccionado = selTiempo ? selTiempo.value : "2 semanas";
    const modulosSeleccionados = selModulos ? Number(selModulos.value) : 4;

    const contenedorCard = document.getElementById(idCard);
    if (contenedorCard) {
        const acciones = document.getElementById(`acciones-${idCard}`);
        if (acciones) {
            acciones.innerHTML = `<span style="color: #60a5fa; font-size: 0.85rem; font-weight: bold;">⚙️ Generando ruta con ${modulosSeleccionados} módulos para ${tiempoSeleccionado}...</span>`;
        }
    }

    enviarMensaje(true, temaOriginal, modulosSeleccionados, tiempoSeleccionado);
}

// Mantener compatibilidad si se llama la función anterior
function forzarGeneracionNueva(promptOriginal, idCard) {
    mostrarPreguntasNuevoPlan(promptOriginal, idCard);
}

function renderizarDOMMensajeIAPlan(datos, planObjeto) {
    const div = document.createElement('div');
    div.className = 'mensaje';

    // Guardar el plan en localStorage antes de incrustar el iframe o renderizar
    if (planObjeto) {
        localStorage.setItem("plan_estudio_actual", JSON.stringify(planObjeto));
    }

    const mensajeTexto = datos.mensaje || datos.respuesta || "✨ ¡Plan de estudio generado con éxito!";
    const idPlan = datos.id_plan || (planObjeto && planObjeto.id_plan) || "";
    const urlVisor = `/principal/interfaz plan de estudio/visor_plan.html${idPlan ? `?id=${idPlan}` : ''}`;

    div.innerHTML = `
       <div class="avatar">
    <img src="avatar.png" alt="Avatar IA" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
</div>
<div class="contenido" style="width: 85%;">
    <p><strong>${escaparHTML(mensajeTexto)}</strong></p>
    <p style="margin-top: 5px; font-size: 14px; opacity: 0.9;">
        He estructurado tu ruta de aprendizaje a tu medida con quizzes y control de fatiga.
    </p>
    <div style="margin: 12px 0;">
        <a href="${urlVisor}" style="display:inline-block; padding: 8px 16px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; font-weight:bold; font-size:14px;">
            ↗️ Abrir Plan en Pantalla Completa
        </a>
    </div>
    <div style="border-radius: 10px; overflow: hidden; border: 1px solid #334155; margin-top: 10px;">
        <iframe src="${urlVisor}" style="width: 100%; height: 500px; border: none; background: #0f172a;"></iframe>
    </div>
</div>
    `;

    // Enviar el plan directamente al iframe vía postMessage cuando termine de cargar
    const iframe = div.querySelector('iframe');
    if (iframe) {
        iframe.addEventListener('load', () => {
            try {
                iframe.contentWindow.postMessage({ tipo: 'CARGAR_PLAN', plan: planObjeto }, '*');
            } catch (err) {
                console.warn("Aviso al enviar postMessage al iframe:", err);
            }
        });
    }

    chatBox.appendChild(div);
}

function agregarMensajeIARespuestaPlan(datos, planObjeto) {
    renderizarDOMMensajeIAPlan(datos, planObjeto);
    listaMensajesUI.push({ tipo: 'ia_plan', datos, planObjeto });
    guardarEstadoChat();
}

function renderizarDOMMensajeError(mensaje) {
    const div = document.createElement('div');
    div.className = 'mensaje';
    div.innerHTML = `
        <div class="avatar" style="background:#dc2626;">⚠️</div>
        <div class="contenido" style="background:#7f1d1d;"><p><strong>Error:</strong> ${escaparHTML(mensaje)}</p></div>
    `;
    chatBox.appendChild(div);
}

function agregarMensajeError(mensaje) {
    renderizarDOMMensajeError(mensaje);
    listaMensajesUI.push({ tipo: 'error', texto: mensaje });
    guardarEstadoChat();
}

// Escuchar peticiones de iframes hijos
window.addEventListener('message', (event) => {
    if (event.data && event.data.tipo === 'SOLICITAR_PLAN' && window.ultimoPlanGenerado) {
        if (event.source) {
            event.source.postMessage({ tipo: 'CARGAR_PLAN', plan: window.ultimoPlanGenerado }, '*');
        }
    }
});

// ==========================================
// AUXILIARES
// ==========================================
function removerElemento(id) { 
    const el = document.getElementById(id); 
    if (el) el.remove(); 
}

function scrollAlFondo() { 
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight; 
}

function escaparHTML(str) { 
    if (!str) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;"); 
}