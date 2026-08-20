// ia/renderizador.js

// 1. Función principal que construye la interfaz a partir del JSON de la IA
function renderizarPlan(datosJSON) {
    if (!datosJSON) return;

    // A. Llenar Metadatos en el Header
    const meta = datosJSON.metadatos || {};
    document.getElementById('titulo-plan').innerText = meta.titulo || "Plan de Estudio Personalizado";
    document.getElementById('descripcion-plan').innerText = meta.descripcion_general || "";
    document.getElementById('nivel-plan').innerText = `${meta.materia || 'General'} • ${meta.nivel || 'Plan'}`;

    // B. Construir los Módulos Semanales
    const contenedor = document.getElementById('contenedor-modulos');
    contenedor.innerHTML = ''; // Limpiar contenedor

    const cronograma = datosJSON.cronograma || [];

    cronograma.forEach((modulo, index) => {
        const idModulo = `modulo-${index + 1}`;
        
        // Asignar etiqueta según el número de módulo
        let claseNivel = 'basico';
        let textoNivel = `Módulo ${modulo.semana || index + 1}: Inicial`;
        if (index === 1) { claseNivel = 'intermedio'; textoNivel = `Módulo ${modulo.semana || index + 1}: Intermedio`; }
        if (index >= 2) { claseNivel = 'avanzado'; textoNivel = `Módulo ${modulo.semana || index + 1}: Avanzado`; }

        // 1. Crear Lista de Actividades
        let htmlActividades = '';
        (modulo.dias || []).forEach(dia => {
            (dia.actividades || []).forEach(act => {
                htmlActividades += `
                    <label class="tarea-item">
                        <input type="checkbox" onchange="actualizarProgreso()">
                        <span class="check-custom"></span>
                        <div class="tarea-texto">
                            <strong>${escapar(act)}</strong>
                            <small>📅 Día ${dia.dia || 1}: ${escapar(dia.tema || '')} • ⏱️ ${dia.tiempo_estimado_minutos || 40} min</small>
                            ${dia.control_fatiga ? `<small style="color:#f59e0b; display:block;">💡 Pausa: ${escapar(dia.control_fatiga)}</small>` : ''}
                        </div>
                    </label>
                `;
            });
        });

        // 2. Crear Mini Quiz si existe
        let htmlQuiz = '';
        if (modulo.mini_quiz && modulo.mini_quiz.length > 0) {
            const quiz = modulo.mini_quiz[0];
            let botonesOpciones = '';
            (quiz.opciones || []).forEach((opc, opcIdx) => {
                botonesOpciones += `<button onclick="verificarRespuesta(this, ${opcIdx})">${escapar(opc)}</button>`;
            });

            htmlQuiz = `
                <div class="quiz-box">
                    <h4>🧪 Mini Quiz de Evaluación</h4>
                    <p>${escapar(quiz.pregunta)}</p>
                    <div class="opciones-quiz" data-correcta="${quiz.respuesta_correcta_indice || 0}">
                        ${botonesOpciones}
                    </div>
                    <div class="feedback-quiz"></div>
                </div>
            `;
        }

        // 3. Ensamblar la Tarjeta del Módulo
        const tarjetaModulo = `
            <section class="modulo-card">
                <div class="modulo-header" onclick="alternarModulo('${idModulo}')">
                    <div class="modulo-titulo-area">
                        <span class="nivel-tag ${claseNivel}">${textoNivel}</span>
                        <h2>${escapar(modulo.titulo_semana || 'Módulo de Estudio')}</h2>
                    </div>
                    <span class="flecha" id="flecha-${idModulo}">▼</span>
                </div>
                
                <div class="modulo-contenido" id="${idModulo}">
                    <div class="lista-tareas">
                        ${htmlActividades}
                    </div>
                    ${htmlQuiz}
                </div>
            </section>
        `;

        contenedor.innerHTML += tarjetaModulo;
    });

    // Actualizar conteo de progreso inicial
    actualizarProgreso();
}

// 2. Actualizar barra de progreso dinámica
function actualizarProgreso() {
    const checkboxes = document.querySelectorAll('.tarea-item input[type="checkbox"]');
    const total = checkboxes.length;
    let marcadas = 0;

    checkboxes.forEach(chk => { if (chk.checked) marcadas++; });

    const porcentaje = total > 0 ? Math.round((marcadas / total) * 100) : 0;
    document.getElementById('barra-progreso').style.width = porcentaje + '%';
    document.getElementById('porcentaje-texto').innerText = porcentaje + '%';
    document.getElementById('contador-tareas').innerText = `${marcadas} de ${total} actividades completadas`;
}

// 3. Colapsar / Expandir Módulo
function alternarModulo(id) {
    const contenido = document.getElementById(id);
    const flecha = document.getElementById('flecha-' + id);
    if (contenido.style.display === 'none') {
        contenido.style.display = 'flex';
        flecha.style.transform = 'rotate(0deg)';
    } else {
        contenido.style.display = 'none';
        flecha.style.transform = 'rotate(-90deg)';
    }
}

// 4. Validar respuestas del Mini Quiz
function verificarRespuesta(boton, indiceSeleccionado) {
    const contenedorOpciones = boton.parentElement;
    const indiceCorrecto = parseInt(contenedorOpciones.getAttribute('data-correcta'));
    const botones = contenedorOpciones.querySelectorAll('button');
    const feedback = contenedorOpciones.nextElementSibling;

    botones.forEach(btn => btn.disabled = true);

    if (indiceSeleccionado === indiceCorrecto) {
        boton.classList.add('correcto');
        feedback.innerHTML = '<span style="color: #34d399;">✅ ¡Correcto! Has superado este módulo.</span>';
    } else {
        boton.classList.add('incorrecto');
        if (botones[indiceCorrecto]) botones[indiceCorrecto].classList.add('correcto');
        feedback.innerHTML = '<span style="color: #f87171;">❌ Incorrecto. Revisa el tema para reforzar.</span>';
    }
}

// 5. Temporizador de Control de Fatiga (Pomodoro 25 min)
let tiempoSegundos = 25 * 60;
let intervalo = null;
let enPausa = true;

function alternarTimer() {
    const btn = document.getElementById('btn-timer');
    const estado = document.getElementById('estado-fatiga');

    if (enPausa) {
        enPausa = false;
        btn.innerText = "Pausar";
        estado.innerText = "Sesión de estudio activa. ¡Mantén el enfoque!";
        intervalo = setInterval(() => {
            if (tiempoSegundos > 0) {
                tiempoSegundos--;
                const min = Math.floor(tiempoSegundos / 60);
                const seg = tiempoSegundos % 60;
                document.getElementById('temporizador').innerText = 
                    `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
            } else {
                clearInterval(intervalo);
                alert("🔔 ¡Sesión completada! Toma una pausa activa de 5 min.");
                tiempoSegundos = 5 * 60;
                enPausa = true;
                btn.innerText = "Iniciar Descanso";
            }
        }, 1000);
    } else {
        enPausa = true;
        clearInterval(intervalo);
        btn.innerText = "Continuar";
        estado.innerText = "Sesión en pausa.";
    }
}

function escapar(str) {
    if (!str) return '';
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// 6. Cargar automáticamente si los datos vienen en localStorage
document.addEventListener("DOMContentLoaded", () => {
    const datosGuardados = localStorage.getItem("plan_estudio_actual");
    if (datosGuardados) {
        renderizarPlan(JSON.parse(datosGuardados));
    }
});
