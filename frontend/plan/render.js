import { escapeHTML } from '../shared/dom.js';
import { actualizarProgreso, restaurarEstadoProgresoLocal } from './progreso.js';
import { autoIniciarTimer } from './temporizador.js';

// Exponemos funciones al window para que los onclick inline del HTML generado funcionen
window.actualizarProgresoGlobal = (el) => {
    const params = new URLSearchParams(window.location.search);
    actualizarProgreso(el, params.get('id') || 'actual');
};

export function renderizarPlan(plan) {
    if (!plan) return;
    if (plan.plan_json) plan = plan.plan_json;
    if (plan.contenido_json) plan = plan.contenido_json;
    if (plan.plan) plan = plan.plan;

    const params = new URLSearchParams(window.location.search);
    const planId = plan.id_plan || params.get('id') || 'actual';

    const titulo = plan.titulo || "Plan de Estudio Personalizado";
    const materia = plan.materia || "Ruta de Aprendizaje";
    const descripcion = plan.descripcion || "Lecciones teóricas, ejemplos prácticos y ejercicios resueltos paso a paso.";
    const fatiga = plan.recomendacion_fatiga || "Estudia 25 min y realiza pausas activas de 5 min.";

    if (document.getElementById('titulo-plan')) document.getElementById('titulo-plan').innerText = titulo;
    if (document.getElementById('badge-materia')) document.getElementById('badge-materia').innerText = materia;
    if (document.getElementById('descripcion-plan')) document.getElementById('descripcion-plan').innerText = descripcion;
    if (document.getElementById('estado-fatiga')) document.getElementById('estado-fatiga').innerText = fatiga;

    const listaModulos = plan.modulos || [];
    const contenedor = document.getElementById('contenedor-modulos');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    listaModulos.forEach((modulo, index) => {
        const idMod = modulo.id || `mod-${index + 1}`;
        const tituloMod = modulo.titulo || `Módulo ${index + 1}`;
        const tagNivel = modulo.nivel_tag || (index === 0 ? 'Nivel 1: Fundamentos' : index === 1 ? 'Nivel 2: Básico' : `Nivel ${index + 1}`);
        const claseNivel = modulo.nivel_clase || (index === 0 ? 'basico' : index === 1 ? 'intermedio' : 'avanzado');

        let htmlTeoriaModulo = '';
        if (modulo.teoria_modulo || modulo.teoria || modulo.objetivo) {
            const txt = modulo.teoria_modulo || modulo.teoria || modulo.objetivo;
            htmlTeoriaModulo = `<div style="background: #172033; border-left: 4px solid #2563eb; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
                <strong style="color: #60a5fa; font-size: 14px; display: block; margin-bottom: 6px;">📖 Marco Teórico del Módulo:</strong>
                <p style="color: #cbd5e1; font-size: 13.5px; line-height: 1.6;">${escapeHTML(txt)}</p></div>`;
        }

        let htmlLecciones = '';
        const lecciones = modulo.lecciones || modulo.tareas || [];

        lecciones.forEach((lec, lIdx) => {
            const idLec = `lec-${idMod}-${lIdx}`;
            const tituloLec = lec.titulo || `Lección ${lIdx + 1}`;
            const duracion = lec.duracion_minutos || 45;
            const idModDB = modulo.id_modulo || (index + 1);
            const idTemaDB = lec.id_tema || (lIdx + 1);

            const teoria = lec.concepto_teorico || (lec.guia_aprendizaje && lec.guia_aprendizaje.explicacion_teorica) || lec.detalle || '';
            const puntos = lec.puntos_clave || (lec.guia_aprendizaje && lec.guia_aprendizaje.puntos_clave) || [];
            const codigo = lec.ejemplo_codigo_o_formula || (lec.guia_aprendizaje && lec.guia_aprendizaje.ejemplo_explicado) || '';
            const ejercicio = lec.ejercicio_practico || (lec.guia_aprendizaje && lec.guia_aprendizaje.ejercicio_resuelto) || null;

            let puntosHTML = puntos.length > 0 ? `<div style="margin-top: 10px;"><strong style="color: #60a5fa; font-size: 13px;">💡 Puntos Clave y Reglas:</strong>
                <ul style="margin: 6px 0 0 18px; color: #cbd5e1; font-size: 13px; line-height: 1.5;">${puntos.map(p => `<li>${escapeHTML(p)}</li>`).join('')}</ul></div>` : '';

            let codigoHTML = codigo ? `<div style="margin-top: 12px;"><strong style="color: #38bdf8; font-size: 13px;">💻 Código / Ejemplo Explicado:</strong>
                <pre style="background: #0b1120; border: 1px solid #334155; color: #38bdf8; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 13px; overflow-x: auto; margin-top: 6px; white-space: pre-wrap;"><code>${escapeHTML(codigo)}</code></pre></div>` : '';

            let ejercicioHTML = '';
            if (ejercicio) {
                const enunciado = ejercicio.enunciado || (typeof ejercicio === 'string' ? ejercicio : '');
                const solucion = ejercicio.solucion_paso_a_paso || ejercicio.solucion || '';
                ejercicioHTML = `<div style="margin-top: 12px; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 14px;">
                    <strong style="color: #34d399; font-size: 13px;">✍️ Ejercicio de Práctica:</strong>
                    <p style="color: #f8fafc; font-size: 13px; margin: 6px 0;">${escapeHTML(enunciado)}</p>
                    ${solucion ? `<details style="margin-top: 8px; background: #0f172a; border: 1px dashed #10b981; border-radius: 6px; padding: 8px 12px; cursor: pointer;">
                        <summary style="color: #34d399; font-size: 12.5px; font-weight: bold;">🔍 Ver Solución Paso a Paso</summary>
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #334155; color: #f1f5f9; font-size: 13px; white-space: pre-line;">${escapeHTML(solucion)}</div></details>` : ''}</div>`;
            }

            htmlLecciones += `<div class="tarea-contenedor" style="margin-bottom: 12px;">
                <div class="tarea-item" style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                        <label class="check-box-wrapper" style="display: flex; align-items: center; cursor: pointer; padding: 4px;" title="Marcar lección como realizada">
                            <input type="checkbox" id="chk-${idLec}" data-modulo="${idModDB}" data-tema="${idTemaDB}" onchange="window.actualizarProgresoGlobal(this); window.sincronizarBotonLeccion('${idLec}', this.checked); window.autoIniciarTimer();">
                            <span class="check-custom"></span>
                        </label>
                        <div class="tarea-texto" style="cursor: pointer; flex: 1;" onclick="window.alternarGuia('${idLec}', this.closest('.tarea-item').querySelector('.btn-ver-guia')); window.autoIniciarTimer();" title="Clic para abrir o cerrar el contenido de la lección">
                            <strong>${escapeHTML(tituloLec)}</strong>
                            <small>⏱️ ${duracion} min • Contenido y práctica</small>
                        </div>
                    </div>
                    <button type="button" class="btn-ver-guia" onclick="window.alternarGuia('${idLec}', this); window.autoIniciarTimer();">📖 Abrir Lección</button>
                </div>
                <div class="guia-aprendizaje-drawer" id="${idLec}" style="display: none; background: #0f172a; border: 1.5px solid #3b82f6; border-radius: 12px; padding: 18px; margin-top: 6px;">
                    <div style="font-size: 13.5px; line-height: 1.6; color: #f1f5f9;">
                        <strong style="color: #60a5fa; font-size: 14px; display: block; margin-bottom: 6px;">📚 Concepto y Explicación:</strong>
                        <p style="white-space: pre-line; color: #cbd5e1; font-size: 13.5px; line-height: 1.7;">${escapeHTML(teoria)}</p>
                        ${puntosHTML}${codigoHTML}${ejercicioHTML}
                        <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                            <span style="font-size: 12.5px; color: #94a3b8;">💡 Lee la lección y resuelve el ejercicio práctico antes de marcarla como completada.</span>
                            <button type="button" class="btn-marcar-hecha" id="btn-completar-${idLec}" onclick="window.alternarCompletadoDesdeGuia('${idLec}'); window.autoIniciarTimer();" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; font-size: 13px; cursor: pointer; transition: all 0.2s;">✔️ Marcar como completada</button>
                        </div>
                    </div>
                </div>
            </div>`;
        });

        let htmlQuizzes = '';
        const quizzes = modulo.mini_quizzes || (modulo.quiz ? [modulo.quiz] : []);
        quizzes.forEach((quizObj, qIdx) => {
            const tituloQ = quizObj.titulo || `Comprobación ${qIdx + 1}`;
            const pregunta = quizObj.pregunta || "¿Pregunta de evaluación?";
            let opciones = quizObj.opciones || [];
            let correcta = typeof quizObj.indice_correcto === 'number' ? quizObj.indice_correcto : 0;

            const letras = ['A', 'B', 'C', 'D', 'E', 'F'];
            let opcionesMapeadas = opciones.map((opc, idx) => ({ texto: opc, esCorrecta: idx === correcta }));
            for (let i = opcionesMapeadas.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [opcionesMapeadas[i], opcionesMapeadas[j]] = [opcionesMapeadas[j], opcionesMapeadas[i]];
            }
            const nuevoIndiceCorrecto = opcionesMapeadas.findIndex(item => item.esCorrecta);
            let botones = '';
            opcionesMapeadas.forEach((item, opcIdx) => {
                const letraPrefijo = letras[opcIdx] ? `<strong>${letras[opcIdx]})</strong> ` : '';
                botones += `<button type="button" onclick="window.verificarRespuesta(this, ${opcIdx}); window.autoIniciarTimer();">${letraPrefijo}${escapeHTML(item.texto)}</button>`;
            });

            htmlQuizzes += `<div class="quiz-box" style="margin-top: 16px;">
                <h4>🧪 ${escapeHTML(tituloQ)}</h4><p>${escapeHTML(pregunta)}</p>
                <div class="opciones-quiz" data-correcta="${nuevoIndiceCorrecto}">${botones}</div>
                <div class="feedback-quiz"></div></div>`;
        });

        contenedor.innerHTML += `<section class="modulo-card" id="card-${idMod}">
            <div class="modulo-header" onclick="window.alternarModulo('${idMod}'); window.autoIniciarTimer();">
                <div class="modulo-titulo-area">
                    <span class="nivel-tag ${claseNivel}">${escapeHTML(tagNivel)}</span>
                    <h2>${escapeHTML(tituloMod)}</h2>
                </div>
                <span class="flecha" id="flecha-${idMod}">▼</span>
            </div>
            <div class="modulo-contenido" id="${idMod}" style="display: none;">
                ${htmlTeoriaModulo}<div class="lista-tareas">${htmlLecciones}</div>${htmlQuizzes}
            </div>
        </section>`;
    });

    restaurarEstadoProgresoLocal(planId);
    actualizarProgreso(null, planId);
}

// Funciones UI expuestas globalmente para los onclick inline generados dinámicamente
window.alternarGuia = function(idLec, boton) {
    const guia = document.getElementById(idLec);
    if (!guia) return;
    if (guia.style.display === 'none' || !guia.style.display) {
        guia.style.display = 'block';
        if (boton) { boton.innerText = "✖ Cerrar Lección"; boton.style.background = "#475569"; }
    } else {
        guia.style.display = 'none';
        if (boton) { boton.innerText = "📖 Abrir Lección"; boton.style.background = "#2563eb"; }
    }
};

window.alternarCompletadoDesdeGuia = function(idLec) {
    const chk = document.getElementById(`chk-${idLec}`);
    if (chk) {
        chk.checked = !chk.checked;
        window.actualizarProgresoGlobal(chk);
        window.sincronizarBotonLeccion(idLec, chk.checked);
    }
};

window.sincronizarBotonLeccion = function(idLec, estaCompletada) {
    const btn = document.getElementById(`btn-completar-${idLec}`);
    if (btn) {
        if (estaCompletada) {
            btn.innerText = "↩️ Desmarcar lección";
            btn.style.background = "#334155";
            btn.style.color = "#94a3b8";
        } else {
            btn.innerText = "✔️ Marcar como completada";
            btn.style.background = "#10b981";
            btn.style.color = "white";
        }
    }
};

window.alternarModulo = function(id) {
    const contenido = document.getElementById(id);
    const flecha = document.getElementById('flecha-' + id);
    if (!contenido) return;
    if (contenido.style.display === 'none') {
        contenido.style.display = 'flex';
        if (flecha) flecha.style.transform = 'rotate(0deg)';
    } else {
        contenido.style.display = 'none';
        if (flecha) flecha.style.transform = 'rotate(-90deg)';
    }
};