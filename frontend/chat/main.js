import { getUserId, clearSession } from '../shared/session.js';
import { apiRequest } from '../shared/api.js';
import { chatState, saveChatState, loadChatState, clearChatState } from './state.js';
import { renderUserMessage, renderLoading, removeElement, scrollToBottom } from './ui.js';
import { loadHistory, sendChatMessage } from './logic.js';

// UI Elements
const promptInput = document.getElementById('prompt-input');
const btnEnviar = document.getElementById('btn-enviar');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

// Init
document.addEventListener('DOMContentLoaded', async () => {
    await syncGoogleUser();
    loadChatState();
    loadHistory();
    // Restaurar UI pendiente (simplificado)
});

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
        } catch (e) { console.warn("Sync Google error:", e); }
    }
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
    if (sidebar?.classList.contains('active')) window.toggleMenu();
};

window.enviarMensaje = async () => {
    const texto = promptInput?.value.trim();
    if (!texto && !chatState.attachedFile) return;

    chatState.history.push({ rol: "usuario", texto });
    renderUserMessage(texto);
    if (promptInput) promptInput.value = '';

    btnEnviar.disabled = true;
    const loadId = `carga-${Date.now()}`;
    renderLoading(loadId);
    scrollToBottom();

    try {
        const datos = await sendChatMessage(texto);
        removeElement(loadId);

        // Aquí iría la lógica de renderizar la respuesta de la IA (llamando a funciones de ui.js)
        console.log("Respuesta IA:", datos);
        chatState.history.push({ rol: "ia", texto: datos.mensaje || "Procesado." });
        saveChatState();
    } catch (error) {
        removeElement(loadId);
        renderUserMessage(`⚠️ Error: ${error.message}`);
    } finally {
        btnEnviar.disabled = false;
        promptInput?.focus();
        scrollToBottom();
    }
};

window.manejarEnter = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        window.enviarMensaje();
    }
};

// File handling (simplificado)
window.activarInputArchivo = () => document.getElementById('input-archivo')?.click();

window.manejarArchivoSeleccionado = (evento) => {
    const file = evento.target.files?.[0];
    if (!file) return;
    chatState.attachedFile = file;
    document.getElementById('nombre-archivo-adjunto').innerText = file.name;
    document.getElementById('contenedor-adjunto').style.display = 'flex';
    document.getElementById('btn-adjuntar').classList.add('activo');
};

window.quitarArchivoAdjunto = () => {
    chatState.attachedFile = null;
    document.getElementById('input-archivo').value = '';
    document.getElementById('contenedor-adjunto').style.display = 'none';
    document.getElementById('btn-adjuntar').classList.remove('activo');
};