/* ==========================================================
           ESTADO Y DATOS DE LA APLICACIÓN
        ========================================================== */
        const state = {
            completedLessons: new Set(),
            completedQuizzes: new Set(),
            activities: {},
            energy: 100,
            sessionSeconds: 0,
            timerSeconds: 25 * 60,
            timerRunning: false,
            timerInterval: null,
            sessionInterval: null
        };

        const philosophicalQuotes = [
            '"El arte no reproduce lo visible; hace visible lo invisible." — Paul Klee',
            '"La belleza salvará al mundo." — Fiódor Dostoyevski',
            '"Tenemos el arte para no morir de la verdad." — Friedrich Nietzsche',
            '"Lo bello es el objeto de un placer completamente desinteresado." — Immanuel Kant',
            '"El ojo ve sólo lo que la mente está preparada para comprender." — Henri Bergson'
        ];

        const quizData = {
            1: {
                title: "Evaluación: Mímesis y la Grecia Antigua",
                questions: [
                    {
                        q: "¿Por qué desconfiaba Platón de los pintores y poetas en 'La República'?",
                        options: [
                            "Porque cobraban sumas excesivas por sus obras.",
                            "Porque sus obras son copias de apariencias, a tres grados de la Verdad esencial.",
                            "Porque solo rendían tributo a dioses extranjeros."
                        ],
                        correct: 1
                    },
                    {
                        q: "¿Qué función primordial cumple la Catarsis según Aristóteles?",
                        options: [
                            "Purificar emociones como el temor y la compasión a través de la representación dramática.",
                            "Fomentar el entrenamiento militar en las polis.",
                            "Demostrar que el arte carece de utilidad cívica."
                        ],
                        correct: 0
                    }
                ]
            },
            2: {
                title: "Evaluación: El Juicio Estético y lo Sublime",
                questions: [
                    {
                        q: "Para Kant, el juicio de gusto (lo Bello) se caracteriza fundamentalmente por:",
                        options: [
                            "Depender directamente del costo material del objeto.",
                            "Un agrado desinteresado, universal sin concepto.",
                            "Un análisis estrictamente moral del contenido."
                        ],
                        correct: 1
                    },
                    {
                        q: "¿Cuál es el rasgo distintivo de 'Lo Sublime' frente a 'Lo Bello'?",
                        options: [
                            "Lo Sublime genera un placer armonioso y delicado.",
                            "Lo Sublime implica una experiencia de inmensidad o poder que abruma nuestros sentidos antes de elevarnos.",
                            "Lo Sublime solo existe en obras de arte decorativas."
                        ],
                        correct: 1
                    }
                ]
            },
            3: {
                title: "Evaluación: Nihilismo, Vanguardia y Readymade",
                questions: [
                    {
                        q: "¿Cómo describe Nietzsche el principio de lo 'Dionisíaco'?",
                        options: [
                            "La forma equilibrada, la escultura clásica y la mesura lógica.",
                            "El éxtasis caótico, la disolución de la individualidad y la pulsión musical profunda.",
                            "La imitación científica de la naturaleza."
                        ],
                        correct: 1
                    },
                    {
                        q: "¿Cuál es el impacto capital de la Fuente (1917) de Marcel Duchamp?",
                        options: [
                            "Demostrar su maestría en la fundición de porcelana.",
                            "Trasladar la pregunta del '¿cómo está hecho?' al '¿por qué es esto arte?', inaugurando el arte conceptual.",
                            "Eliminar los museos en Europa."
                        ],
                        correct: 1
                    }
                ]
            },
            4: {
                title: "Evaluación: Postmodernidad y Era Algorítmica",
                questions: [
                    {
                        q: "¿Qué es el 'Aura' para Walter Benjamin?",
                        options: [
                            "Una cualidad mística exclusiva de las personas virtuosas.",
                            "La manifestación irrepetible de una lejanía, ligada al aquí y ahora de la obra original.",
                            "El precio fijado por las galerías del mercado."
                        ],
                        correct: 1
                    },
                    {
                        q: "Baudrillard define el 'Simulacro' contemporáneo como:",
                        options: [
                            "Una copia fiel de un paisaje natural.",
                            "La generación por modelos de algo real sin origen ni realidad: una hiperrealidad.",
                            "Una corriente pictórica impresionista."
                        ],
                        correct: 1
                    }
                ]
            }
        };

        const activityPrompts = {
            1: "Selecciona una escultura clásica (ej. El Discóbolo) y redacta en 3-4 líneas cómo la criticaría Platón (por ser copia de una copia) y cómo la defendería Aristóteles (por su estructura armónica y mímesis ennoblecida).",
            2: "Describe un momento en que experimentaste 'lo sublime' (un paisaje tormentoso, la inmensidad del océano, la noche estrellada). Explica por qué esa sensación combinó sobrecogimiento con placer intelectual.",
            3: "Imagina que exhibes un smartphone roto en un museo de arte contemporáneo. ¿Qué título le pondrías y qué argumento filosófico-artístico le darías a los críticos para justificar su valor?",
            4: "Redacta tu veredicto: Cuando una Inteligencia Artificial genera una obra visual conmovedora, ¿dónde reside el arte: en el algoritmo, en el creador del 'prompt', o en el ojo humano que la contempla?"
        };

        /* ==========================================================
           INICIALIZACIÓN
        ========================================================== */
        window.addEventListener('DOMContentLoaded', () => {
            loadPersistedState();
            startSessionTracking();
            updateUI();
            rotateQuotes();
        });

        function toggleModule(id) {
            const body = document.getElementById(`module-body-${id}`);
            const chevron = document.getElementById(`chevron-${id}`);
            if (body.classList.contains('open')) {
                body.classList.remove('open');
                chevron.textContent = '▼';
            } else {
                body.classList.add('open');
                chevron.textContent = '▲';
            }
        }

        /* ==========================================================
           PROGRESO & LECCIONES
        ========================================================== */
        function completeLesson(modId, lessonId) {
            const key = `${modId}-${lessonId}`;
            if (!state.completedLessons.has(key)) {
                state.completedLessons.add(key);
                consumeEnergy(8); // estudiar consume energía cognitiva
                showFeedback("¡Lección asimilada! Has avanzado en el módulo.");
            } else {
                state.completedLessons.delete(key);
            }
            saveState();
            updateUI();
        }

        function updateUI() {
            // Actualizar lecciones
            document.querySelectorAll('.lesson-item').forEach(el => {
                const id = el.id.replace('lesson-', '');
                if (state.completedLessons.has(id)) {
                    el.classList.add('completed');
                    el.querySelector('button').textContent = '✓ Completado';
                    el.querySelector('button').classList.remove('btn-outline');
                    el.querySelector('button').classList.add('btn');
                } else {
                    el.classList.remove('completed');
                    el.querySelector('button').textContent = 'Marcar Leído';
                    el.querySelector('button').classList.add('btn-outline');
                }
            });

            // Calcular % global (8 lecciones + 4 quizzes = 12 items)
            const totalItems = 8 + 4;
            const completedItems = state.completedLessons.size + state.completedQuizzes.size;
            const percentage = Math.min(100, Math.round((completedItems / totalItems) * 100));

            document.getElementById('global-progress-bar').style.width = `${percentage}%`;
            document.getElementById('global-progress-text').textContent = `${percentage}%`;

            // Módulos completados
            let finishedMods = 0;
            for (let i = 1; i <= 4; i++) {
                if (state.completedLessons.has(`${i}-1`) && 
                    state.completedLessons.has(`${i}-2`) && 
                    state.completedQuizzes.has(i)) {
                    finishedMods++;
                }
            }
            document.getElementById('modules-completed-text').textContent = `${finishedMods} / 4`;

            updateFatigueUI();
        }

        /* ==========================================================
           CONTROL DE FATIGA Y ENERGÍA
        ========================================================== */
        function consumeEnergy(amount) {
            state.energy = Math.max(10, state.energy - amount);
            updateFatigueUI();
        }

        function updateFatigueUI() {
            const circle = document.getElementById('energy-indicator');
            const val = document.getElementById('energy-val');
            const status = document.getElementById('energy-status-text');
            const advice = document.getElementById('fatigue-advice');

            val.textContent = `${state.energy}%`;

            if (state.energy > 70) {
                circle.style.borderTopColor = 'var(--success)';
                status.textContent = 'Lúcida';
                status.style.color = 'var(--success)';
                advice.textContent = 'Mente fresca para asimilar conceptos complejos y realizar evaluaciones.';
            } else if (state.energy > 35) {
                circle.style.borderTopColor = 'var(--warning)';
                status.textContent = 'Moderada';
                status.style.color = 'var(--warning)';
                advice.textContent = 'Fatiga incipiente. Te recomendamos reflexionar sin sobrecargarte de lecturas.';
            } else {
                circle.style.borderTopColor = 'var(--danger)';
                status.textContent = 'Sobrecarga';
                status.style.color = 'var(--danger)';
                advice.textContent = '⚠️ Fatiga cognitiva alta. Los conceptos filosóficos requieren pausa para asentarse.';
            }
        }

        function triggerContemplationBreak() {
            const overlay = document.getElementById('modal-overlay');
            const content = document.getElementById('modal-content');
            
            content.innerHTML = `
                <div style="text-align: center; padding: 1rem;">
                    <span style="font-size: 3rem;">🏛️</span>
                    <h3 class="font-serif" style="margin: 1rem 0; color: var(--gold);">Pausa de Contemplación Estética</h3>
                    <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">
                        Cierra los ojos o contempla tu entorno durante 2 minutos sin emitir juicios ni categorizaciones.
                        Deja que las ideas que has leído se asienten sin forzar conclusiones.
                    </p>
                    <div style="background: rgba(255,255,255,0.03); border: 1px dashed var(--border-color); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;">
                        <p style="font-style: italic; color: #e2e8f0;">"El silencio es el espacio donde el pensamiento se convierte en contemplación."</p>
                    </div>
                    <button class="btn" onclick="recoverEnergy()">He completado mi pausa (+40% Energía)</button>
                </div>
            `;
            overlay.classList.add('active');
        }

        function recoverEnergy() {
            state.energy = Math.min(100, state.energy + 40);
            updateFatigueUI();
            closeModal();
            showFeedback("Energía mental restaurada. Tu mente está lista para continuar.");
        }

        /* ==========================================================
           TEMPORIZADOR FOCUS
        ========================================================== */
        function toggleTimer() {
            const btn = document.getElementById('timer-btn');
            if (state.timerRunning) {
                clearInterval(state.timerInterval);
                state.timerRunning = false;
                btn.textContent = 'Continuar';
            } else {
                state.timerRunning = true;
                btn.textContent = 'Pausar';
                state.timerInterval = setInterval(() => {
                    if (state.timerSeconds > 0) {
                        state.timerSeconds--;
                        renderTimer();
                    } else {
                        clearInterval(state.timerInterval);
                        state.timerRunning = false;
                        btn.textContent = 'Iniciar';
                        state.timerSeconds = 25 * 60;
                        consumeEnergy(20);
                        alert("🔔 ¡Bloque de enfoque terminado! Es hora de una pausa estética.");
                        triggerContemplationBreak();
                    }
                }, 1000);
            }
        }

        function resetTimer() {
            clearInterval(state.timerInterval);
            state.timerRunning = false;
            state.timerSeconds = 25 * 60;
            document.getElementById('timer-btn').textContent = 'Iniciar';
            renderTimer();
        }

        function renderTimer() {
            const mins = Math.floor(state.timerSeconds / 60).toString().padStart(2, '0');
            const secs = (state.timerSeconds % 60).toString().padStart(2, '0');
            document.getElementById('timer-display').textContent = `${mins}:${secs}`;
        }

        function startSessionTracking() {
            state.sessionInterval = setInterval(() => {
                state.sessionSeconds++;
                const mins = Math.floor(state.sessionSeconds / 60).toString().padStart(2, '0');
                const secs = (state.sessionSeconds % 60).toString().padStart(2, '0');
                document.getElementById('session-time').textContent = `${mins}:${secs}`;

                // Cada 15 minutos en sesión continua, pequeña merma de energía
                if (state.sessionSeconds % 900 === 0) {
                    consumeEnergy(10);
                }
            }, 1000);
        }

        function rotateQuotes() {
            let idx = 0;
            setInterval(() => {
                idx = (idx + 1) % philosophicalQuotes.length;
                document.getElementById('quote-box').textContent = philosophicalQuotes[idx];
            }, 12000);
        }

        /* ==========================================================
           MODALES: ACTIVIDAD & QUIZ
        ========================================================== */
        function openActivityModal(modId) {
            const overlay = document.getElementById('modal-overlay');
            const content = document.getElementById('modal-content');
            const savedText = state.activities[modId] || '';

            content.innerHTML = `
                <h3 class="font-serif" style="color: var(--gold); margin-bottom: 0.5rem;">Actividad de Reflexión Crítica — Módulo ${modId}</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">
                    ${activityPrompts[modId]}
                </p>
                <textarea id="act-input" class="activity-textarea" placeholder="Escribe aquí tu análisis o disertación...">${savedText}</textarea>
                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
                    <button class="btn" onclick="saveActivity(${modId})">Guardar Reflexión</button>
                </div>
            `;
            overlay.classList.add('active');
        }

        function saveActivity(modId) {
            const text = document.getElementById('act-input').value.trim();
            if (text.length < 15) {
                alert("Por favor desarrolla una respuesta más profunda para ejercitar el pensamiento crítico.");
                return;
            }
            state.activities[modId] = text;
            consumeEnergy(10);
            saveState();
            closeModal();
            showFeedback("Reflexión guardada en tu bitácora de estudios.");
        }

        function openQuizModal(modId) {
            const overlay = document.getElementById('modal-overlay');
            const content = document.getElementById('modal-content');
            const quiz = quizData[modId];

            let html = `
                <h3 class="font-serif" style="color: var(--gold); margin-bottom: 0.5rem;">${quiz.title}</h3>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem;">
                    Responde con precisión conceptual para validar el módulo.
                </p>
                <div id="quiz-container">
            `;

            quiz.questions.forEach((q, qIndex) => {
                html += `
                    <div style="margin-bottom: 1.5rem;">
                        <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem;">${qIndex + 1}. ${q.q}</h4>
                        <div>
                            ${q.options.map((opt, oIndex) => `
                                <button class="quiz-opt" onclick="selectAnswer(this, ${modId}, ${qIndex}, ${oIndex}, ${q.correct})">
                                    ${opt}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `;
            });

            html += `
                </div>
                <div style="display:flex; justify-content:flex-end; margin-top: 1rem;">
                    <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
                </div>
            `;

            content.innerHTML = html;
            overlay.classList.add('active');
        }

        function selectAnswer(button, modId, qIndex, selectedIndex, correctIndex) {
            const parent = button.parentElement;
            const buttons = parent.querySelectorAll('.quiz-opt');
            
            // Bloquear re-clicks
            buttons.forEach(b => b.style.pointerEvents = 'none');

            if (selectedIndex === correctIndex) {
                button.classList.add('correct');
                state.completedQuizzes.add(modId);
                consumeEnergy(5);
                saveState();
                updateUI();
                showFeedback("¡Respuesta filosóficamente certera!");
            } else {
                button.classList.add('incorrect');
                buttons[correctIndex].classList.add('correct');
                showFeedback("Respuesta incorrecta. Revisa el material de lectura.");
            }
        }

        function closeModal() {
            document.getElementById('modal-overlay').classList.remove('active');
        }

        /* ==========================================================
           NOTIFICACIONES FEEDBACK
        ========================================================== */
        function showFeedback(msg) {
            const toast = document.createElement('div');
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.right = '20px';
            toast.style.background = '#1e293b';
            toast.style.color = '#f8fafc';
            toast.style.padding = '12px 20px';
            toast.style.borderRadius = '8px';
            toast.style.borderLeft = '4px solid var(--gold)';
            toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
            toast.style.zIndex = '9999';
            toast.style.fontSize = '0.9rem';
            toast.textContent = msg;

            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.transition = 'opacity 0.4s ease';
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 400);
            }, 3000);
        }

        /* ==========================================================
           PERSISTENCIA (LOCALSTORAGE)
        ========================================================== */
        function saveState() {
            const data = {
                completedLessons: Array.from(state.completedLessons),
                completedQuizzes: Array.from(state.completedQuizzes),
                activities: state.activities,
                energy: state.energy
            };
            localStorage.setItem('athena_study_state', JSON.stringify(data));
        }

        function loadPersistedState() {
            const raw = localStorage.getItem('athena_study_state');
            if (raw) {
                try {
                    const data = JSON.parse(raw);
                    state.completedLessons = new Set(data.completedLessons || []);
                    state.completedQuizzes = new Set(data.completedQuizzes || []);
                    state.activities = data.activities || {};
                    state.energy = data.energy !== undefined ? data.energy : 100;
                } catch (e) {
                    console.error("Error al cargar estado:", e);
                }
            }
        }