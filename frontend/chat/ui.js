import { escapeHTML } from '../shared/dom.js';

const chatBox = document.getElementById('chat-box');
const AVATAR_IA = `<div class="avatar"><img src="avatar.png" alt="Avatar IA" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"></div>`;

window.planesSugeridos = window.planesSugeridos || {};

export function renderUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'mensaje';
    div.style.flexDirection = 'row-reverse';
    div.innerHTML = `
        <div class="avatar" style="background:#1e293b; display:flex; justify-content:center; align-items:center;">👩🏻‍💻</div>
        <div class="contenido" style="background:#1e293b;"><p>${escapeHTML(text)}</p></div>`;
    chatBox.appendChild(div);
}

export function renderIAMessage(text) {
    const div = document.createElement('div');
    div.className = 'mensaje';
    div.innerHTML = `${AVATAR_IA}<div class="contenido"><p>${escapeHTML(text)}</p></div>`;
    chatBox.appendChild(div);
}

export function renderLoading(id, text = "StudNova IA está respondiendo...") {
    const div = document.createElement('div');
    div.className = 'mensaje mensaje-carga';
    div.id = id;
    div.innerHTML = `
        ${AVATAR_IA}
        <div class="contenido contenido-carga">
            <div class="indicador-escritura"><span></span><span></span><span></span></div>
            <p class="texto-carga">${text}</p>
        </div>`;
    chatBox.appendChild(div);
    return id;
}

export function removeElement(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

export function scrollToBottom() {
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
}

export function renderPlanMessage(datos, planObjeto) {
    if (planObjeto) {
        localStorage.setItem("plan_estudio_actual", JSON.stringify(planObjeto));
    }

    const mensajeTexto = datos.mensaje || datos.respuesta || "✨ ¡Plan de estudio generado con éxito!";
    const idPlan = datos.id_plan || (planObjeto && planObjeto.id_plan) || "";
    const urlVisor = `/plan/visor_plan.html${idPlan ? `?id=${idPlan}` : ''}`;

    const div = document.createElement('div');
    div.className = 'mensaje';
    div.innerHTML = `
        ${AVATAR_IA}
        <div class="contenido" style="width: 85%;">
            <p><strong>${escapeHTML(mensajeTexto)}</strong></p>
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
        </div>`;

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

export function renderSuggestion(datos) {
    const plan = datos.plan_sugerido || {};
    const idPlan = datos.id_plan;
    window.planesSugeridos[idPlan] = plan;

    const titulo = plan.titulo || "Plan de Estudio";
    const descripcion = plan.descripcion || "Ruta estructurada de aprendizaje interactivo.";
    const modulosCount = (plan.modulos && Array.isArray(plan.modulos)) ? plan.modulos.length : 3;
    const materia = plan.materia || "Materia Principal";
    const temaOriginal = datos.prompt_original || materia;
    const idCard = `sugerencia-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const div = document.createElement('div');
    div.className = 'mensaje';
    div.innerHTML = `
        ${AVATAR_IA}
        <div class="contenido" style="width: 85%;">
            <div class="tarjeta-sugerencia" id="${idCard}">
                <div class="sugerencia-badge">💡 Plan similar encontrado en biblioteca</div>
                <div class="sugerencia-titulo">${escapeHTML(titulo)}</div>
                <div class="sugerencia-desc">${escapeHTML(descripcion)}</div>
                <div class="sugerencia-meta">
                    <span class="meta-item">📖 ${modulosCount} módulos</span>
                    <span class="meta-item">🏷️ ${escapeHTML(materia)}</span>
                    <span class="meta-item ahorro">⚡ 0 tokens requeridos (Carga instantánea)</span>
                </div>
                <p style="font-size: 0.9rem; color: #f1f5f9; margin-bottom: 12px; font-weight: 500;">
                    Ya existe este plan estructurado que cubre tu consulta. ¿Qué deseas hacer?
                </p>
                <div class="sugerencia-acciones" id="acciones-${idCard}">
                    <button type="button" class="btn-sugerencia btn-sugerencia-aceptar">
                        📖 1. Ver este plan existente
                    </button>
                    <button type="button" class="btn-sugerencia btn-sugerencia-nuevo">
                        ✨ 2. Generar un plan nuevo con IA
                    </button>
                </div>
            </div>
        </div>`;

    const [btnAceptar, btnNuevo] = div.querySelectorAll('.btn-sugerencia');
    btnAceptar?.addEventListener('click', () => window.aceptarPlanSugerido(idPlan, idCard));
    btnNuevo?.addEventListener('click', () => window.mostrarPreguntasNuevoPlan(temaOriginal, idCard));

    chatBox.appendChild(div);
    return idCard;
}

export function renderError(mensaje) {
    const div = document.createElement('div');
    div.className = 'mensaje';
    div.innerHTML = `
        <div class="avatar" style="background:#dc2626;">⚠️</div>
        <div class="contenido" style="background:#7f1d1d;"><p><strong>Error:</strong> ${escapeHTML(mensaje)}</p></div>`;
    chatBox.appendChild(div);
}

export function renderStoredMessage(item) {
    if (!item) return;
    if (item.tipo === 'usuario') renderUserMessage(item.texto);
    else if (item.tipo === 'ia_texto') renderIAMessage(item.texto);
    else if (item.tipo === 'ia_plan') renderPlanMessage(item.datos, item.planObjeto);
    else if (item.tipo === 'ia_sugerencia') renderSuggestion(item.datos);
    else if (item.tipo === 'error') renderError(item.texto);
}
