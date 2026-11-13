import { getUserId, clearSession } from '../shared/session.js';
import { apiRequest } from '../shared/api.js';
import { escapeHTML } from '../shared/dom.js';
import { chatState, saveChatState, loadChatState, clearChatState } from './state.js';
import {
    renderUserMessage,
    renderIAMessage,
    renderLoading,
    removeElement,
    scrollToBottom,
    renderPlanMessage,
    renderSuggestion,
    renderError,
    renderStoredMessage
} from './ui.js';
import { loadHistory, sendChatMessage, extraerPlan } from './logic.js';

const promptInput = document.getElementById('prompt-input');
const btnEnviar = document.getElementById('btn-enviar');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

window.ultimoPlanGenerado = null;

document.addEventListener('DOMContentLoaded', async () => {
    await syncGoogleUser();
    loadChatState();
    window.ultimoPlanGenerado = chatState.currentPlan;
    renderStoredChat();
    loadHistory();
});

function renderStoredChat() {
    if (!Array.isArray(chatState.uiMessages) || chatState.uiMessages.length === 0) return;

    const chatBox = document.getElementById('chat-box');
    if (chatBox) chatBox.innerHTML = '';
    chatState.uiMessages.forEach(renderStoredMessage);
    scrollToBottom();
}

function guardarMensajeUI(item) {
    chatState.uiMessages.push(item);
    saveChatState();
}

async function syncGoogleUser() {
    const idActual = localStorage.getItem("id_usuario");
    const email = localStorage.getItem("userEmail");
    const nombre = localStorage.getItem("userName");

    if (email && (!idActual || idActual === "13" || isNaN(parseInt(idActual)))) {
        try {
            const u = await apiRequest("/usuario/google", {
                method: "POST",
                body: JSON.stringify({ nombre: nombre || "Estudiante", correo: email })
            });
            localStorage.setItem("id_usuario", u.id_usuario);
            localStorage.setItem("user", JSON.stringify(u));
        } catch (e) {
            console.warn("Sync Google error:", e);
        }
    }
}

function construirTextoAMostrar(texto, forzarNuevo, cantModulos, duracionDeseada) {
    const hayAdjunto = Boolean(chatState.attachedFile);

    if (forzarNuevo) {
        const detalle = [];
        if (cantModulos) detalle.push(`${cantModulos} módulos`);
        if (duracionDeseada) detalle.push(`en ${duracionDeseada}`);
        const strDetalle = detalle.length > 0 ? ` (${detalle.join(', ')})` : '';
        return `✨ Prefiero generar un plan nuevo desde cero${strDetalle}: "${texto}"`;
    }

    if (hayAdjunto) {
        const detalle = [];
        if (cantModulos) detalle.push(`${cantModulos} módulos`);
        if (duracionDeseada) detalle.push(duracionDeseada);
        const strDetalle = detalle.length > 0 ? ` (${detalle.join(', ')})` : '';
        const mensajeBase = texto || "Crea un plan de estudio a partir de este documento adjunto.";
        return `📄 [Adjunto: ${chatState.attachedFile.name}${strDetalle}]\n${mensajeBase}`;
    }

    return texto;
}

window.cerrarSesion = () => {
    clearSession();
    window.location.href = "/landing/index.html";
};

window.toggleMenu = () => {
    sidebar?.classList.toggle('active');
    overlay?.classList.toggle('active');
};

window.iniciarNuevoChat = () => {
    clearChatState();
    window.ultimoPlanGenerado = null;

    const chatBox = document.getElementById('chat-box');
    if (chatBox) {
        chatBox.innerHTML = `
            <div class="mensaje">
                <div class="avatar"><img src="avatar.png" alt="Avatar" style="border-radius:50%; object-fit:cover;"></div>
                <div class="contenido">
                    <p>¡Hola! 👋 Soy tu asistente de <strong>StudNova IA</strong>.</p>
                    <p style="margin-top: 8px;">Cuéntame, ¿qué materia o tema te gustaría aprender hoy?</p>
                </div>
            </div>`;
    }

    quitarArchivoAdjunto();
    if (sidebar?.classList.contains('active')) window.toggleMenu();
};

window.enviarMensaje = async (forzarNuevo = false, promptPersonalizado = null, cantModulosParam = null, duracionParam = null) => {
    const texto = promptPersonalizado !== null
        ? promptPersonalizado.trim()
        : (promptInput?.value.trim() || '');

    if (!texto && !chatState.attachedFile) return;

    const hayAdjunto = Boolean(chatState.attachedFile);
    const selModulos = document.getElementById('select-modulos');
    const selDuracion = document.getElementById('select-duracion');

    const cantModulos = cantModulosParam || ((hayAdjunto && selModulos && selModulos.value) ? Number(selModulos.value) : null);
    const duracionDeseada = duracionParam || ((hayAdjunto && selDuracion && selDuracion.value) ? selDuracion.value : null);
    const textoAMostrar = construirTextoAMostrar(texto, forzarNuevo, cantModulos, duracionDeseada);

    chatState.history.push({ rol: "usuario", texto: textoAMostrar });
    renderUserMessage(textoAMostrar);
    guardarMensajeUI({ tipo: 'usuario', texto: textoAMostrar });

    if (promptInput && !promptPersonalizado) promptInput.value = '';
    if (btnEnviar) {
        btnEnviar.disabled = true;
        btnEnviar.style.opacity = '0.5';
    }

    const loadId = `carga-${Date.now()}`;
    renderLoading(loadId);
    scrollToBottom();

    try {
        const datos = await sendChatMessage(texto, forzarNuevo, cantModulos, duracionDeseada);
        removeElement(loadId);

        if (datos.tipo === "sugerencia_plan_existente") {
            const textoIA = datos.mensaje || "He encontrado un plan existente similar a tu solicitud.";
            chatState.history.push({ rol: "ia", texto: textoIA });
            renderSuggestion(datos);
            guardarMensajeUI({ tipo: 'ia_sugerencia', datos });
            return;
        }

        const textoIA = datos.mensaje || datos.respuesta || "He procesado tu solicitud.";
        chatState.history.push({ rol: "ia", texto: textoIA });

        const planObjeto = extraerPlan(datos);
        if (planObjeto) {
            window.ultimoPlanGenerado = planObjeto;
            chatState.currentPlan = planObjeto;
            localStorage.setItem("plan_estudio_actual", JSON.stringify(planObjeto));
            renderPlanMessage(datos, planObjeto);
            guardarMensajeUI({ tipo: 'ia_plan', datos, planObjeto });
            loadHistory();
        } else {
            renderIAMessage(textoIA);
            guardarMensajeUI({ tipo: 'ia_texto', texto: textoIA });
        }

        quitarArchivoAdjunto();
    } catch (error) {
        removeElement(loadId);
        renderError(error.message);
        guardarMensajeUI({ tipo: 'error', texto: error.message });
    } finally {
        if (btnEnviar) {
            btnEnviar.disabled = false;
            btnEnviar.style.opacity = '1';
        }
        promptInput?.focus();
        saveChatState();
        scrollToBottom();
    }
};

window.manejarEnter = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        window.enviarMensaje();
    }
};

window.activarInputArchivo = () => document.getElementById('input-archivo')?.click();

window.manejarArchivoSeleccionado = (evento) => {
    const file = evento.target.files?.[0];
    if (!file) return;

    chatState.attachedFile = file;
    document.getElementById('nombre-archivo-adjunto').innerText = file.name;
    document.getElementById('contenedor-adjunto').style.display = 'flex';
    document.getElementById('btn-adjuntar').classList.add('activo');
};

function quitarArchivoAdjunto() {
    chatState.attachedFile = null;

    const input = document.getElementById('input-archivo');
    if (input) input.value = '';

    const selModulos = document.getElementById('select-modulos');
    if (selModulos) selModulos.value = '';

    const selDuracion = document.getElementById('select-duracion');
    if (selDuracion) selDuracion.value = '';

    const contenedor = document.getElementById('contenedor-adjunto');
    if (contenedor) contenedor.style.display = 'none';

    document.getElementById('btn-adjuntar')?.classList.remove('activo');
}

window.quitarArchivoAdjunto = quitarArchivoAdjunto;

window.aceptarPlanSugerido = async (idPlan, idCard) => {
    const contenedorCard = document.getElementById(idCard);
    if (contenedorCard) {
        contenedorCard.querySelectorAll('button').forEach(b => {
            b.disabled = true;
            b.style.opacity = '0.5';
        });
    }

    const loadId = renderLoading(`carga-${Date.now()}`, "StudNova IA está estructurando tu plan personalizado...");
    scrollToBottom();

    try {
        const datos = await apiRequest("/api/ia/aceptar-sugerencia", {
            method: "POST",
            body: JSON.stringify({
                id_plan: Number(idPlan),
                id_usuario: Number(getUserId())
            })
        });

        removeElement(loadId);

        const planObjeto = datos.plan || window.planesSugeridos[idPlan] || datos;
        window.ultimoPlanGenerado = planObjeto;
        chatState.currentPlan = planObjeto;
        localStorage.setItem("plan_estudio_actual", JSON.stringify(planObjeto));
        loadHistory();

        if (contenedorCard) {
            contenedorCard.style.borderColor = '#10b981';
            const acciones = contenedorCard.querySelector('.sugerencia-acciones');
            if (acciones) {
                acciones.innerHTML = '<span style="color: #34d399; font-size: 0.85rem; font-weight: bold;">✔️ Has seleccionado ver este plan existente</span>';
            }
        }

        renderPlanMessage(datos, planObjeto);
        guardarMensajeUI({ tipo: 'ia_plan', datos, planObjeto });
        saveChatState();
    } catch (e) {
        removeElement(loadId);
        renderError(e.message);
        guardarMensajeUI({ tipo: 'error', texto: e.message });
    }
};

window.mostrarPreguntasNuevoPlan = (temaOriginal, idCard) => {
    const contenedorAcciones = document.getElementById(`acciones-${idCard}`);
    if (!contenedorAcciones) return;

    contenedorAcciones.innerHTML = `
        <div class="formulario-preguntas-nuevo" style="background:#0f172a; padding:12px; border-radius:8px; border:1px solid #334155; margin-top:8px;">
            <p style="font-size:0.9rem; color:#72AFC1; font-weight:bold; margin-bottom:8px;">
                🎯 Personaliza tu nuevo plan sobre "${escapeHTML(temaOriginal)}":
            </p>
            <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:10px;">
                <div style="flex:1; min-width:130px;">
                    <label style="font-size:0.75rem; color:#94a3b8; display:block; margin-bottom:4px; font-weight:600;">⏱️ ¿En cuánto tiempo?</label>
                    <select id="tiempo-${idCard}" style="width:100%; padding:6px; background:#1e293b; color:#f8fafc; border:1px solid #475569; border-radius:6px; font-size:0.85rem;">
                        <option value="1 semana">1 semana (Intensivo)</option>
                        <option value="2 semanas" selected>2 semanas (Recomendado)</option>
                        <option value="1 mes">1 mes (Paso a paso)</option>
                        <option value="2 meses">2 meses (A profundidad)</option>
                    </select>
                </div>
                <div style="flex:1; min-width:130px;">
                    <label style="font-size:0.75rem; color:#94a3b8; display:block; margin-bottom:4px; font-weight:600;">📚 ¿Cuántos módulos?</label>
                    <select id="modulos-${idCard}" style="width:100%; padding:6px; background:#1e293b; color:#f8fafc; border:1px solid #475569; border-radius:6px; font-size:0.85rem;">
                        <option value="3">3 módulos (Esencial)</option>
                        <option value="4" selected>4 módulos (Equilibrado)</option>
                        <option value="5">5 módulos (Completo)</option>
                    </select>
                </div>
            </div>
            <button type="button" class="btn-sugerencia btn-sugerencia-nuevo" style="width:100%; justify-content:center; padding:8px;">
                🚀 ¡Generar mi plan personalizado!
            </button>
        </div>`;

    contenedorAcciones.querySelector('button')
        ?.addEventListener('click', () => window.confirmarNuevoPlanPersonalizado(temaOriginal, idCard));

    scrollToBottom();
};

window.confirmarNuevoPlanPersonalizado = (temaOriginal, idCard) => {
    const selTiempo = document.getElementById(`tiempo-${idCard}`);
    const selModulos = document.getElementById(`modulos-${idCard}`);

    const tiempoSeleccionado = selTiempo ? selTiempo.value : "2 semanas";
    const modulosSeleccionados = selModulos ? Number(selModulos.value) : 4;

    const acciones = document.getElementById(`acciones-${idCard}`);
    if (acciones) {
        acciones.innerHTML = `<span style="color: #60a5fa; font-size: 0.85rem; font-weight: bold;">⚙️ Generando ruta con ${modulosSeleccionados} módulos para ${tiempoSeleccionado}...</span>`;
    }

    window.enviarMensaje(true, temaOriginal, modulosSeleccionados, tiempoSeleccionado);
};

window.addEventListener('message', (event) => {
    if (event.data?.tipo === 'SOLICITAR_PLAN' && chatState.currentPlan && event.source) {
        event.source.postMessage({ tipo: 'CARGAR_PLAN', plan: chatState.currentPlan }, '*');
    }
});
