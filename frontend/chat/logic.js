import { API_BASE } from '../shared/config.js';
import { getUserId } from '../shared/session.js';
import { apiRequest } from '../shared/api.js';
import { chatState, saveChatState } from './state.js';

export async function loadHistory() {
    const id = getUserId();
    try {
        const planes = await apiRequest(`/plan-estudio/usuario/${id}`);
        const historyList = document.getElementById('history-list');
        if (!historyList) return;

        historyList.innerHTML = planes?.length ? '' : '<li class="sin-planes">No hay planes aún.</li>';

        planes?.forEach(plan => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `
                <span class="plan-title">${plan.titulo || plan.nombre || "Plan"}</span>
                <span class="plan-date">${plan.fecha_creacion ? new Date(plan.fecha_creacion).toLocaleDateString() : 'Reciente'}</span>`;
            li.onclick = () => {
                localStorage.setItem("plan_estudio_actual", JSON.stringify(plan));
                window.location.href = '/plan/visor_plan.html';
            };
            historyList.appendChild(li);
        });
    } catch (error) {
        console.warn("Error cargando historial:", error);
    }
}

export async function sendChatMessage(text, forzarNuevo = false, modulos = null, duracion = null) {
    const idUsuario = getUserId();
    const hayAdjunto = Boolean(chatState.attachedFile);

    let payload = {};
    let endpoint = "/api/ia/generar";
    let options = { method: "POST" };

    if (hayAdjunto) {
        endpoint = "/api/ia/generar-con-archivo";
        const formData = new FormData();
        formData.append('prompt', text || "Genera un plan a partir de este documento.");
        formData.append('id_usuario', idUsuario);
        if (modulos) formData.append('cantidad_modulos', modulos);
        if (duracion) formData.append('duracion_personalizada', duracion);
        formData.append('historial_json', JSON.stringify(chatState.history.slice(0, -1)));
        formData.append('archivo', chatState.attachedFile);
        options.body = formData;
        delete options.headers; // Fetch pone Content-Type multipart automáticamente
    } else {
        let promptFinal = text;
        if (forzarNuevo) {
            promptFinal = `Genera directamente el plan de estudio estructurado completo en JSON sobre: ${text}.`;
            if (modulos) promptFinal += ` Requisito: exactamente ${modulos} módulos.`;
            if (duracion) promptFinal += ` Tiempo: ${duracion}.`;
        }
        options.headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
        options.body = JSON.stringify({
            prompt: promptFinal,
            historial: chatState.history,
            id_usuario: idUsuario,
            forzar_nuevo: forzarNuevo,
            cantidad_modulos: modulos ? Number(modulos) : null,
            duracion_personalizada: duracion || null
        });
    }

    try {
        const datos = await apiRequest(endpoint, options);

        if (datos.tipo === "sugerencia_plan_existente") {
            // Manejar sugerencia (simplificado para el ejemplo)
            console.log("Sugerencia:", datos);
            return datos;
        }

        const planObjeto = datos.plan || datos;
        chatState.currentPlan = planObjeto;
        localStorage.setItem("plan_estudio_actual", JSON.stringify(planObjeto));
        saveChatState();
        return datos;
    } catch (error) {
        throw error;
    }
}