import { getUserId } from '../shared/session.js';
import { apiRequest } from '../shared/api.js';

export function actualizarProgreso(checkboxEl, planId) {
    const checkboxes = document.querySelectorAll('.tarea-item input[type="checkbox"]');
    const total = checkboxes.length;
    const marcadas = Array.from(checkboxes).filter(chk => chk.checked).length;
    const porcentaje = total > 0 ? Math.round((marcadas / total) * 100) : 0;

    const elBarra = document.getElementById('barra-progreso');
    const elTexto = document.getElementById('porcentaje-texto');
    const elContador = document.getElementById('contador-tareas');

    if (elBarra) elBarra.style.width = porcentaje + '%';
    if (elTexto) elTexto.innerText = porcentaje + '%';
    if (elContador) elContador.innerText = `${marcadas} de ${total} lecciones completadas`;

    document.querySelectorAll('.modulo-card').forEach(card => {
        const totalMod = card.querySelectorAll('input[type="checkbox"]').length;
        const marcadasMod = card.querySelectorAll('input[type="checkbox"]:checked').length;
        if (totalMod > 0 && totalMod === marcadasMod) marcarCardComoCompletada(card);
    });

    guardarEstadoProgresoLocal(planId);

    if (checkboxEl && planId) {
        const idUsuario = getUserId();
        const idModulo = parseInt(checkboxEl.getAttribute('data-modulo')) || 1;
        const idTema = parseInt(checkboxEl.getAttribute('data-tema')) || 1;

        if (idUsuario) {
            apiRequest('/progreso/', {
                method: 'POST',
                body: JSON.stringify({
                    id_usuario: idUsuario, id_plan: parseInt(planId),
                    id_modulo: idModulo, id_tema: idTema,
                    porcentaje: parseFloat(porcentaje), completado: checkboxEl.checked
                })
            }).catch(err => console.warn("Aviso: no se pudo guardar progreso:", err));
        }
    }
}

export function marcarCardComoCompletada(moduloCard) {
    if (!moduloCard || moduloCard.classList.contains('modulo-completado')) return;
    moduloCard.classList.add('modulo-completado');
    const tituloArea = moduloCard.querySelector('.modulo-titulo-area');
    if (tituloArea && !tituloArea.querySelector('.badge-completado')) {
        const badge = document.createElement('span');
        badge.className = 'badge-completado';
        badge.innerText = '✔️ Completado';
        badge.style.cssText = 'background: #065f46; color: #34d399; font-size: 11px; padding: 2px 8px; border-radius: 6px; font-weight: bold; margin-left: 8px; vertical-align: middle;';
        tituloArea.appendChild(badge);
    }
}

export function guardarEstadoProgresoLocal(planId) {
    try {
        const checkboxes = document.querySelectorAll('.tarea-item input[type="checkbox"]');
        const estados = Array.from(checkboxes).map((chk, idx) => chk.checked ? idx : -1).filter(idx => idx !== -1);
        localStorage.setItem(`studnova_progreso_plan_${planId}`, JSON.stringify(estados));
    } catch (e) { console.warn("Error guardando progreso local:", e); }
}

export function restaurarEstadoProgresoLocal(planId) {
    try {
        const guardado = localStorage.getItem(`studnova_progreso_plan_${planId}`);
        if (guardado) {
            const indices = JSON.parse(guardado);
            const checkboxes = document.querySelectorAll('.tarea-item input[type="checkbox"]');
            indices.forEach(idx => {
                if (checkboxes[idx]) {
                    checkboxes[idx].checked = true;
                    checkboxes[idx].dispatchEvent(new Event('change'));
                }
            });
        }
    } catch (e) { console.warn("Error restaurando progreso local:", e); }
}

export function completarModulo(idMod, planId) {
    const contenido = document.getElementById(idMod);
    if (!contenido) return;

    contenido.querySelectorAll('input[type="checkbox"]').forEach(chk => { chk.checked = true; });
    contenido.querySelectorAll('.quiz-box').forEach(qb => {
        const opcionesDiv = qb.querySelector('.opciones-quiz');
        if (opcionesDiv) {
            const correcta = parseInt(opcionesDiv.getAttribute('data-correcta')) || 0;
            const botones = opcionesDiv.querySelectorAll('button');
            botones.forEach(b => b.disabled = true);
            if (botones[correcta]) botones[correcta].classList.add('correcto');
        }
        const fb = qb.querySelector('.feedback-quiz');
        if (fb) fb.innerHTML = '<span style="color: #34d399;">✅ Módulo y comprobación completados.</span>';
    });

    const lastCheck = contenido.querySelector('input[type="checkbox"]');
    if (lastCheck) actualizarProgreso(lastCheck, planId);

    const moduloCard = contenido.closest('.modulo-card');
    if (moduloCard) marcarCardComoCompletada(moduloCard);
}