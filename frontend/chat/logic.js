import { getUserId } from '../shared/session.js';
import { apiRequest } from '../shared/api.js';
import { escapeHTML } from '../shared/dom.js';
import { chatState, saveChatState } from './state.js';

function parseContenido(contenido) {
    if (!contenido) return null;
    if (typeof contenido === 'string') {
        try { return JSON.parse(contenido); } catch { return null; }
    }
    return contenido;
}

export async function loadHistory() {
    const id = getUserId();
    try {
        const planes = await apiRequest(`/plan-estudio/usuario/${id}`);
        const historyList = document.getElementById('history-list');
        if (!historyList) return;

        historyList.innerHTML = planes?.length ? '' : '<li class="sin-planes">No hay planes aún.</li>';

        planes?.forEach(plan => {
            const contenido = parseContenido(plan.contenido_json);
            const planParaVisor = contenido
                ? { ...contenido, id_plan: plan.id_plan, titulo: plan.titulo || contenido.titulo }
                : plan;

            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `
                <span class="plan-title">${escapeHTML(plan.titulo || plan.nombre || "Plan")}</span>
                <span class="plan-date">${plan.fecha_creacion ? new Date(plan.fecha_creacion).toLocaleDateString() : 'Reciente'}</span>`;
            li.onclick = () => {
                localStorage.setItem("plan_estudio_actual", JSON.stringify(planParaVisor));
                window.location.href = `/plan/visor_plan.html${plan.id_plan ? `?id=${plan.id_plan}` : ''}`;
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
    } else {
        let promptFinal = text;
        if (forzarNuevo) {
            promptFinal = `Genera directamente el plan de estudio estructurado completo en JSON sobre: ${text}.`;
            if (modulos) promptFinal += ` Requisito: exactamente ${modulos} módulos.`;
            if (duracion) promptFinal += ` Tiempo: ${duracion}.`;
        }
        options.headers = { 'Accept': 'application/json' };
        options.body = JSON.stringify({
            prompt: promptFinal,
            historial: chatState.history,
            id_usuario: idUsuario,
            forzar_nuevo: forzarNuevo,
            cantidad_modulos: modulos ? Number(modulos) : null,
            duracion_personalizada: duracion || null
        });
    }

    const datos = await apiRequest(endpoint, options);

    if (datos.tipo === "sugerencia_plan_existente") {
        return datos;
    }

    const planObjeto = extraerPlan(datos);
    if (planObjeto) {
        chatState.currentPlan = planObjeto;
        localStorage.setItem("plan_estudio_actual", JSON.stringify(planObjeto));
        saveChatState();
    }

    return datos;
}

export function extraerPlan(datos) {
    const planObjeto = datos.plan || datos;
    const tienePlan = datos.tipo === "plan_generado"
        || Boolean(planObjeto?.modulos?.length)
        || Boolean(datos.modulos?.length);
    return tienePlan ? planObjeto : null;
}
