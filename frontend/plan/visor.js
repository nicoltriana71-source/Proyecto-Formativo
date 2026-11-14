import { renderizarPlan } from './render.js';
import { verificarRespuesta } from './quizzes.js';
import { autoIniciarTimer, alternarTimer, actualizarDisplayTimer } from './temporizador.js';
import { apiRequest } from '../shared/api.js';

// exponer funciones al window para los onclick inline
window.verificarRespuesta = verificarRespuesta;
window.autoIniciarTimer = autoIniciarTimer;
window.alternarTimer = alternarTimer;

// inicializar timer
document.getElementById('btn-timer')?.addEventListener('click', alternarTimer);
actualizarDisplayTimer();

export function volverAlChat(e) {
    if (e) e.preventDefault();
    if (window.opener && !window.opener.closed) {
        try { window.opener.focus(); window.close(); return; } catch (err) {}
    }
    if (window.history.length > 1) {
        window.history.back();
        return;
    }
    window.location.href = '/ia/interfaz.html';
}

window.volverAlChat = volverAlChat;
document.getElementById('btn-volver')?.addEventListener('click', volverAlChat);

document.addEventListener("DOMContentLoaded", async () => {
    if (window.self !== window.top) {
        const btnVolver = document.querySelector('.btn-volver');
        if (btnVolver) btnVolver.style.display = 'none';
    }

    // intentar obtener del padre (iframe)
    if (window.parent && window.parent !== window) {
        try {
            window.parent.postMessage({ tipo: 'SOLICITAR_PLAN' }, '*');
            if (window.parent.ultimoPlanGenerado) {
                renderizarPlan(window.parent.ultimoPlanGenerado);
                return;
            }
        } catch (e) {}
    }

    // intentar cargar desde localStorage
    const guardado = localStorage.getItem("plan_estudio_actual");
    if (guardado) {
        try {
            const planParsed = JSON.parse(guardado);
            if (planParsed && (planParsed.modulos || (planParsed.plan && planParsed.plan.modulos) || planParsed.contenido_json)) {
                renderizarPlan(planParsed);
                return;
            }
        } catch (e) { console.error("Error leyendo localStorage:", e); }
    }

    //  buscar id en la URL y consultar backend
    const params = new URLSearchParams(window.location.search);
    const idPlan = params.get('id') || (window.location.hash ? window.location.hash.replace('#id=', '').replace('#', '') : null);

    if (idPlan && !isNaN(idPlan)) {
        try {
            const data = await apiRequest(`/plan-estudio/${idPlan}`);
            const targetPlan = data.contenido_json || data.plan || data;
            if (targetPlan) {
                renderizarPlan(targetPlan);
                try { localStorage.setItem("plan_estudio_actual", JSON.stringify(targetPlan)); } catch (e) {}
            }
        } catch (err) {
            console.error("Error al consultar plan por ID:", err);
        }
    }
});

// Escuchar mensajes desde ventana padre (chat)
window.addEventListener("message", (evento) => {
    if (evento.data && (evento.data.tipo === "CARGAR_PLAN" || evento.data.plan)) {
        const planRecibido = evento.data.plan || evento.data;
        try { localStorage.setItem("plan_estudio_actual", JSON.stringify(planRecibido)); } catch (e) {}
        renderizarPlan(planRecibido);
    }
});