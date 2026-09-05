// --- CERRAR SESION ---
function cerrarSesion() {
    if (!confirm("¿Seguro que quieres cerrar sesión?")) return;
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login/login.html";
}
// --- FIN CERRAR SESION ---

// Determinar la URL base de la API (si se abre en Live Server 5500/5501 apunta a localhost:8000)
const API_BASE = window.location.port === "8000" ? "" : "http://localhost:8000";

const chatBox = document.getElementById('chat-box');
const promptInput = document.getElementById('prompt-input');
const btnEnviar = document.getElementById('btn-enviar');
let historialConversacion = [];

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
        const respuesta = await fetch(`${API_BASE}/api/ia/generar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: texto, historial: historialConversacion })
        });

        let datos;
        const textoRespuesta = await respuesta.text();
        try { 
            datos = JSON.parse(textoRespuesta); 
        } catch { 
            throw new Error(textoRespuesta || 'Error en la respuesta del servidor'); 
        }

        if (!respuesta.ok) {
            throw new Error(datos.detail || 'Ocurrió un error al procesar');
        }

        const textoIA = datos.mensaje || "He procesado tu respuesta.";
        historialConversacion.push({ rol: "ia", texto: textoIA });

        removerElemento(idCarga);
        agregarMensajeIA(datos);

    } catch (error) {
        removerElemento(idCarga);
        agregarMensajeError(error.message);
    } finally {
        btnEnviar.disabled = false;
        btnEnviar.style.opacity = '1';
        promptInput.focus();
        scrollAlFondo();
    }
}

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

function agregarMensajeIA(datos) {
    const div = document.createElement('div');
    div.className = 'mensaje';
    const tienePlan = (datos.tipo === "plan_generado") || (datos.plan && datos.plan.modulos && datos.plan.modulos.length > 0) || (datos.modulos && datos.modulos.length > 0);

    if (!tienePlan) {
        const mensajeTexto = datos.mensaje || (typeof datos === 'string' ? datos : "Cuéntame más sobre lo que quieres aprender.");
        div.innerHTML = `<div class="avatar">🤖</div><div class="contenido"><p>${escaparHTML(mensajeTexto)}</p></div>`;
    } else {
        const planObjeto = datos.plan || datos;
        const idPlan = datos.id_plan || (datos.plan && datos.plan.id_plan) || "";

        try {
            localStorage.setItem("plan_estudio_actual", JSON.stringify(planObjeto));
        } catch (e) {
            console.error("Error al guardar en localStorage:", e);
        }

        window.ultimoPlanGenerado = planObjeto;

        const mensajeTexto = datos.mensaje || "✨ ¡Plan de estudio generado con éxito!";
        const urlRelativa = `/principal/interfaz%20plan%20de%20estudio/visor_plan.html${idPlan ? `?id=${idPlan}` : ''}`;
        const urlCompleta = `${API_BASE}${urlRelativa}`;

        div.innerHTML = `
            <div class="avatar">🤖</div>
            <div class="contenido" style="width: 85%;">
                <p><strong>${escaparHTML(mensajeTexto)}</strong></p>
                <p style="margin-top: 5px; font-size: 14px; opacity: 0.9;">
                    He estructurado tu ruta de aprendizaje a tu medida con quizzes y control de fatiga.
                </p>
                <div style="margin: 12px 0;">
                    <a href="${urlRelativa}" target="_blank" style="display:inline-block; padding: 8px 16px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; font-weight:bold; font-size:14px;">
                        ↗️ Abrir Plan en Pantalla Completa
                    </a>
                </div>
                <div style="border-radius: 10px; overflow: hidden; border: 1px solid #334155; margin-top: 10px;">
                    <iframe src="${urlRelativa}" style="width: 100%; height: 500px; border: none; background: #0f172a;"></iframe>
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
                    console.error("Error enviando postMessage al iframe:", err);
                }
            });
        }
    }
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

function agregarMensajeError(mensaje) {
    const div = document.createElement('div');
    div.className = 'mensaje';
    div.innerHTML = `
        <div class="avatar" style="background:#dc2626;">⚠️</div>
        <div class="contenido" style="background:#7f1d1d;"><p><strong>Error:</strong> ${escaparHTML(mensaje)}</p></div>
    `;
    chatBox.appendChild(div);
}

function removerElemento(id) { 
    const el = document.getElementById(id); 
    if (el) el.remove(); 
}

function scrollAlFondo() { 
    chatBox.scrollTop = chatBox.scrollHeight; 
}

function escaparHTML(str) { 
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); 
}
