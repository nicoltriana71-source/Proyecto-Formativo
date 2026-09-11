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
window.ultimoPlanGenerado = null;

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    await asegurarUsuarioRegistrado();
    cargarHistorialPlanes();
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
    if (!confirm("¿Seguro que quieres cerrar sesión?")) return;
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login/login.html";
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
    window.open('/principal/interfaz plan de estudio/visor_plan.html', '_blank');
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

async function enviarMensaje() {
    const input = document.getElementById('prompt-input') || promptInput;
    const boton = document.getElementById('btn-enviar') || btnEnviar;
    const texto = input ? input.value.trim() : '';
    if (!texto) return;

    const idUsuario = obtenerIdUsuario();

    agregarMensajeUsuario(texto);
    historialConversacion.push({ rol: "usuario", texto: texto });

    if (input) input.value = '';
    if (boton) {
        boton.disabled = true;
        boton.style.opacity = '0.5';
    }

    const idCarga = agregarMensajeCarga();
    scrollAlFondo();

    try {
        // Consultar el generador de IA que crea planes con Gemini y guarda en la BD
        const respuesta = await fetch(`${API_BASE}/api/ia/generar`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                prompt: texto,
                historial: historialConversacion,
                id_usuario: Number(idUsuario)
            })
        });

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

        const textoIA = datos.mensaje || datos.respuesta || "He procesado tu respuesta.";
        historialConversacion.push({ rol: "ia", texto: textoIA });

        removerElemento(idCarga);

        const tienePlan = (datos.tipo === "plan_generado") || 
                          (datos.plan && datos.plan.modulos && datos.plan.modulos.length > 0) || 
                          (datos.modulos && datos.modulos.length > 0);

        if (tienePlan) {
            const planObjeto = datos.plan || datos;
            window.ultimoPlanGenerado = planObjeto;

            // Guardar plan actual en LocalStorage y refrescar panel de historial de inmediato
            localStorage.setItem("plan_estudio_actual", JSON.stringify(planObjeto));
            cargarHistorialPlanes();

            agregarMensajeIARespuestaPlan(datos, planObjeto);
        } else {
            agregarMensajeIATexto(textoIA);
        }

    } catch (error) {
        removerElemento(idCarga);
        agregarMensajeError(error.message);
    } finally {
        if (boton) {
            boton.disabled = false;
            boton.style.opacity = '1';
        }
        if (input) input.focus();
        scrollAlFondo();
    }
}

// ==========================================
// RENDERIZADO DE MENSAJES EN EL CHAT
// ==========================================
function agregarMensajeUsuario(texto) {
    const div = document.createElement('div');
    div.className = 'mensaje';
    div.style.flexDirection = 'row-reverse';
    div.innerHTML = `
        <div class="avatar" style="background:#1e293b; display:flex; justify-content:center; align-items:center;">👩🏻‍💻</div>
        <div class="contenido" style="background:#1e293b;"><p>${escaparHTML(texto)}</p></div>
    `;
    chatBox.appendChild(div);
}

function agregarMensajeCarga() {
    const id = 'carga-' + Date.now();
    const div = document.createElement('div');
    div.className = 'mensaje';
    div.id = id;
    div.innerHTML = `
        <div class="avatar">🤖</div>
        <div class="contenido"><p>⏳ <em>StudNova IA está respondiendo...</em></p></div>
    `;
    chatBox.appendChild(div);
    return id;
}

function agregarMensajeIATexto(texto) {
    const div = document.createElement('div');
    div.className = 'mensaje';
    div.innerHTML = `
        <div class="avatar">🤖</div>
        <div class="contenido"><p>${escaparHTML(texto)}</p></div>
    `;
    chatBox.appendChild(div);
}

function agregarMensajeIARespuestaPlan(datos, planObjeto) {
    const div = document.createElement('div');
    div.className = 'mensaje';

    const mensajeTexto = datos.mensaje || datos.respuesta || "✨ ¡Plan de estudio generado con éxito!";
    const idPlan = datos.id_plan || (planObjeto && planObjeto.id_plan) || "";
    const urlVisor = `/principal/interfaz plan de estudio/visor_plan.html${idPlan ? `?id=${idPlan}` : ''}`;

    div.innerHTML = `
        <div class="avatar">🤖</div>
        <div class="contenido" style="width: 85%;">
            <p><strong>${escaparHTML(mensajeTexto)}</strong></p>
            <p style="margin-top: 5px; font-size: 14px; opacity: 0.9;">
                He estructurado tu ruta de aprendizaje a tu medida con quizzes y control de fatiga.
            </p>
            <div style="margin: 12px 0;">
                <a href="${urlVisor}" target="_blank" style="display:inline-block; padding: 8px 16px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; font-weight:bold; font-size:14px;">
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

function agregarMensajeError(mensaje) {
    const div = document.createElement('div');
    div.className = 'mensaje';
    div.innerHTML = `
        <div class="avatar" style="background:#dc2626;">⚠️</div>
        <div class="contenido" style="background:#7f1d1d;"><p><strong>Error:</strong> ${escaparHTML(mensaje)}</p></div>
    `;
    chatBox.appendChild(div);
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
