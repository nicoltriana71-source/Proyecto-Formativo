// principal/interfaz plan de estudio/java.js

function renderizarPlan(plan) {
    if (!plan) return;
    if (plan.plan_json) plan = plan.plan_json;
    if (plan.plan) plan = plan.plan;

    // Header
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

        // A. Resumen Teórico del Módulo
        let htmlTeoriaModulo = '';
        if (modulo.teoria_modulo || modulo.teoria || modulo.objetivo) {
            const txt = modulo.teoria_modulo || modulo.teoria || modulo.objetivo;
            htmlTeoriaModulo = `
                <div style="background: #172033; border-left: 4px solid #2563eb; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
                    <strong style="color: #60a5fa; font-size: 14px; display: block; margin-bottom: 6px;">📖 Marco Teórico del Módulo:</strong>
                    <p style="color: #cbd5e1; font-size: 13.5px; line-height: 1.6;">${escapar(txt)}</p>
                </div>
            `;
        }

        // B. Lecciones con Contenido Teórico Profundo y Ejemplos
        let htmlLecciones = '';
        const lecciones = modulo.lecciones || modulo.tareas || [];

        lecciones.forEach((lec, lIdx) => {
            const idLec = `lec-${idMod}-${lIdx}`;
            const tituloLec = lec.titulo || `Lección ${lIdx + 1}`;
            const duracion = lec.duracion_minutos || 45;

            // Extraer teoría y detalles
            const teoria = lec.concepto_teorico || (lec.guia_aprendizaje && lec.guia_aprendizaje.explicacion_teorica) || lec.detalle || '';
            const puntos = lec.puntos_clave || (lec.guia_aprendizaje && lec.guia_aprendizaje.puntos_clave) || [];
            const codigo = lec.ejemplo_codigo_o_formula || (lec.guia_aprendizaje && lec.guia_aprendizaje.ejemplo_explicado) || '';
            const ejercicio = lec.ejercicio_practico || (lec.guia_aprendizaje && lec.guia_aprendizaje.ejercicio_resuelto) || null;

            // Puntos clave
            let puntosHTML = '';
            if (puntos.length > 0) {
                puntosHTML = `
                    <div style="margin-top: 10px;">
                        <strong style="color: #60a5fa; font-size: 13px;">💡 Puntos Clave y Reglas:</strong>
                        <ul style="margin: 6px 0 0 18px; color: #cbd5e1; font-size: 13px; line-height: 1.5;">
                            ${puntos.map(p => `<li>${escapar(p)}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            // Código
            let codigoHTML = '';
            if (codigo) {
                codigoHTML = `
                    <div style="margin-top: 12px;">
                        <strong style="color: #38bdf8; font-size: 13px;">💻 Código / Ejemplo Explicado:</strong>
                        <pre style="background: #0b1120; border: 1px solid #334155; color: #38bdf8; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 13px; overflow-x: auto; margin-top: 6px; white-space: pre-wrap;"><code>${escapar(codigo)}</code></pre>
                    </div>
                `;
            }

            // Ejercicio y solución
            let ejercicioHTML = '';
            if (ejercicio) {
                const enunciado = ejercicio.enunciado || (typeof ejercicio === 'string' ? ejercicio : '');
                const solucion = ejercicio.solucion_paso_a_paso || ejercicio.solucion || '';
                ejercicioHTML = `
                    <div style="margin-top: 12px; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 14px;">
                        <strong style="color: #34d399; font-size: 13px;">✍️ Ejercicio de Práctica:</strong>
                        <p style="color: #f8fafc; font-size: 13px; margin: 6px 0;">${escapar(enunciado)}</p>
                        ${solucion ? `
                            <details style="margin-top: 8px; background: #0f172a; border: 1px dashed #10b981; border-radius: 6px; padding: 8px 12px; cursor: pointer;">
                                <summary style="color: #34d399; font-size: 12.5px; font-weight: bold;">🔍 Ver Solución Paso a Paso</summary>
                                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #334155; color: #f1f5f9; font-size: 13px; white-space: pre-line;">${escapar(solucion)}</div>
                            </details>
                        ` : ''}
                    </div>
                `;
            }

            htmlLecciones += `
                <div class="tarea-contenedor" style="margin-bottom: 12px;">
                    <div class="tarea-item" style="display: flex; justify-content: space-between; align-items: center;">
                        <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; flex: 1;">
                            <input type="checkbox" onchange="actualizarProgreso(); autoIniciarTimer();">
                            <span class="check-custom"></span>
                            <div class="tarea-texto">
                                <strong>${escapar(tituloLec)}</strong>
                                <small>⏱️ ${duracion} min • Contenido y práctica</small>
                            </div>
                        </label>
                        <button type="button" class="btn-ver-guia" onclick="alternarGuia('${idLec}', this); autoIniciarTimer();">📖 Abrir Lección</button>
                    </div>

                    <!-- Panel de la Lección Completa -->
                    <div class="guia-aprendizaje-drawer" id="${idLec}" style="display: none; background: #0f172a; border: 1.5px solid #3b82f6; border-radius: 12px; padding: 18px; margin-top: 6px;">
                        <div style="font-size: 13.5px; line-height: 1.6; color: #f1f5f9;">
                            <strong style="color: #60a5fa; font-size: 14px; display: block; margin-bottom: 6px;">📚 Concepto y Explicación:</strong>
                            <p style="white-space: pre-line; color: #cbd5e1;">${escapar(teoria)}</p>
                            ${puntosHTML}
                            ${codigoHTML}
                            ${ejercicioHTML}
                        </div>
                    </div>
                </div>
            `;
        });

        // C. Mini Quizzes
        let htmlQuizzes = '';
        const quizzes = modulo.mini_quizzes || (modulo.quiz ? [modulo.quiz] : []);

        quizzes.forEach((quizObj, qIdx) => {
            const tituloQ = quizObj.titulo || `Comprobación ${qIdx + 1}`;
            const pregunta = quizObj.pregunta || "¿Pregunta de evaluación?";
            const opciones = quizObj.opciones || [];
            const correcta = quizObj.indice_correcto ?? 0;

            let botones = '';
            opciones.forEach((opc, opcIdx) => {
                botones += `<button onclick="verificarRespuesta(this, ${opcIdx}); autoIniciarTimer();">${escapar(opc)}</button>`;
            });

            htmlQuizzes += `
                <div class="quiz-box" style="margin-top: 16px;">
                    <h4>🧪 ${escapar(tituloQ)}</h4>
                    <p>${escapar(pregunta)}</p>
                    <div class="opciones-quiz" data-correcta="${correcta}">
                        ${botones}
                    </div>
                    <div class="feedback-quiz"></div>
                </div>
            `;
        });

        // D. Tarjeta del Módulo
        const htmlModulo = `
            <section class="modulo-card">
                <div class="modulo-header" onclick="alternarModulo('${idMod}'); autoIniciarTimer();">
                    <div class="modulo-titulo-area">
                        <span class="nivel-tag ${claseNivel}">${escapar(tagNivel)}</span>
                        <h2>${escapar(tituloMod)}</h2>
                    </div>
                    <span class="flecha" id="flecha-${idMod}">▼</span>
                </div>
                
                <div class="modulo-contenido" id="${idMod}">
                    ${htmlTeoriaModulo}
                    <div class="lista-tareas">
                        ${htmlLecciones}
                    </div>
                    ${htmlQuizzes}
                </div>
            </section>
        `;

        contenedor.innerHTML += htmlModulo;
    });

    actualizarProgreso();
}

function alternarGuia(idLec, boton) {
    const guia = document.getElementById(idLec);
    if (!guia) return;

    if (guia.style.display === 'none') {
        guia.style.display = 'block';
        boton.innerText = "✖ Cerrar Lección";
        boton.style.background = "#475569";
    } else {
        guia.style.display = 'none';
        boton.innerText = "📖 Abrir Lección";
        boton.style.background = "#2563eb";
    }
}

function escapar(str) {
    if (!str) return '';
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function actualizarProgreso() {
    const checkboxes = document.querySelectorAll('.tarea-item input[type="checkbox"]');
    const total = checkboxes.length;
    let marcadas = 0;
    checkboxes.forEach(chk => { if (chk.checked) marcadas++; });

    const porcentaje = total > 0 ? Math.round((marcadas / total) * 100) : 0;
    const elBarra = document.getElementById('barra-progreso');
    const elTexto = document.getElementById('porcentaje-texto');
    const elContador = document.getElementById('contador-tareas');

    if (elBarra) elBarra.style.width = porcentaje + '%';
    if (elTexto) elTexto.innerText = porcentaje + '%';
    if (elContador) elContador.innerText = `${marcadas} de ${total} lecciones completadas`;
}

function alternarModulo(id) {
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
}

function verificarRespuesta(boton, indiceSeleccionado) {
    const contenedorOpciones = boton.parentElement;
    const indiceCorrecto = parseInt(contenedorOpciones.getAttribute('data-correcta'));
    const botones = contenedorOpciones.querySelectorAll('button');
    const feedback = contenedorOpciones.nextElementSibling;

    botones.forEach(btn => btn.disabled = true);

    if (indiceSeleccionado === indiceCorrecto) {
        boton.classList.add('correcto');
        feedback.innerHTML = '<span style="color: #34d399;">✅ ¡Correcto! Has comprendido el concepto.</span>';
    } else {
        boton.classList.add('incorrecto');
        if (botones[indiceCorrecto]) botones[indiceCorrecto].classList.add('correcto');
        feedback.innerHTML = '<span style="color: #f87171;">❌ Respuesta incorrecta. Revisa la opción resaltada en verde.</span>';
    }
}

// Pomodoro
let tiempoSegundos = 25 * 60;
let intervalo = null;
let enPausa = true;
let timerIniciadoPreviamente = false;

function autoIniciarTimer() {
    if (!timerIniciadoPreviamente && enPausa) {
        timerIniciadoPreviamente = true;
        alternarTimer();
        const estado = document.getElementById('estado-fatiga');
        if (estado) estado.innerText = "⚡ Sesión iniciada automáticamente por interacción. ¡Enfócate!";
    }
}

function alternarTimer() {
    const btn = document.getElementById('btn-timer');
    const estado = document.getElementById('estado-fatiga');

    if (enPausa) {
        enPausa = false;
        if (btn) btn.innerText = "Pausar";
        if (estado) estado.innerText = "Sesión activa de enfoque. ¡Concéntrate!";
        intervalo = setInterval(() => {
            if (tiempoSegundos > 0) {
                tiempoSegundos--;
                actualizarDisplayTimer();
            } else {
                clearInterval(intervalo);
                alert("🔔 ¡Sesión completada! Toma una pausa activa de 5 minutos.");
                tiempoSegundos = 5 * 60;
                enPausa = true;
                if (btn) btn.innerText = "Iniciar Descanso";
                actualizarDisplayTimer();
            }
        }, 1000);
    } else {
        enPausa = true;
        clearInterval(intervalo);
        if (btn) btn.innerText = "Continuar";
        if (estado) estado.innerText = "Sesión en pausa.";
    }
}

function actualizarDisplayTimer() {
    const minutos = Math.floor(tiempoSegundos / 60);
    const segundos = tiempoSegundos % 60;
    const el = document.getElementById('temporizador');
    if (el) el.innerText = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
}

document.addEventListener("DOMContentLoaded", () => {
    const guardado = localStorage.getItem("plan_estudio_actual");
    if (guardado) {
        try { renderizarPlan(JSON.parse(guardado)); } catch (e) { console.error(e); }
    }
});