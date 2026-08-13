/* =========================================================
       1. DATA STRUCTURE: ALGEBRA CURRICULUM (Basic to Advanced)
       ========================================================= */
    const algebraModules = [
        {
            id: 1,
            level: 'Básico',
            levelClass: 'tag-basic',
            title: '1. Fundamentos y Lenguaje Algebraico',
            desc: 'Términos semejantes, leyes de los signos, leyes de exponentes y jerarquía de operaciones.',
            theory: `
                <h3>Fundamentos del Álgebra</h3>
                <p>El álgebra sustituye números concretos por variables (letras como <span class="math-code">x, y, z</span>) para modelar relaciones universales.</p>
                <div class="math-block">Leyes de Exponentes clave:<br>• (x^a) · (x^b) = x^(a + b)<br>• (x^a) / (x^b) = x^(a - b)<br>• (x^a)^b = x^(a · b)</div>
                <p><strong>Reducción de términos semejantes:</strong> Sólo puedes sumar o restar términos con idéntica variable y exponente. Ej: <span class="math-code">3x² + 5x² = 8x²</span>, pero <span class="math-code">3x² + 2x</span> no se puede simplificar más.</p>
            `,
            practice: {
                question: 'Simplifica la expresión: 4x² + 7x - 2x² + 3x - 5',
                steps: [
                    'Paso 1: Agrupa términos semejantes con x² ➔ (4x² - 2x²) = 2x²',
                    'Paso 2: Agrupa términos con x ➔ (7x + 3x) = 10x',
                    'Paso 3: Identifica los términos independientes ➔ -5',
                    'Resultado final ➔ 2x² + 10x - 5'
                ]
            },
            quiz: {
                question: '¿Cuál es el resultado de simplificar (2x³)(4x⁵)?',
                options: [
                    { text: '8x¹⁵', correct: false },
                    { text: '6x⁸', correct: false },
                    { text: '8x⁸', correct: true },
                    { text: '8x²', correct: false }
                ],
                explanation: 'Multiplicas coeficientes (2 · 4 = 8) y sumas exponentes por la ley del producto (3 + 5 = 8).'
            }
        },
        {
            id: 2,
            level: 'Básico - Intermedio',
            levelClass: 'tag-basic',
            title: '2. Ecuaciones Lineales y Despejes',
            desc: 'Ecuaciones de primer grado, transposición de términos y resolución de problemas cotidianos.',
            theory: `
                <h3>Ecuaciones de Primer Grado</h3>
                <p>Una ecuación es una balanza en equilibrio. La regla de oro: <em>"Lo que hagas a un lado, debes hacérselo al otro"</em>.</p>
                <div class="math-block">Forma General: ax + b = c  ➔  x = (c - b) / a</div>
                <p><strong>Pasos para resolver:</strong><br>1. Eliminar paréntesis.<br>2. Agrupar términos con la variable en un miembro y números en el otro.<br>3. Despejar la incógnita.</p>
            `,
            practice: {
                question: 'Resuelve la ecuación: 3(x - 2) = 2x + 4',
                steps: [
                    'Paso 1: Distribuye el 3 ➔ 3x - 6 = 2x + 4',
                    'Paso 2: Resta 2x a ambos lados ➔ x - 6 = 4',
                    'Paso 3: Suma 6 a ambos lados ➔ x = 10'
                ]
            },
            quiz: {
                question: 'Si 5x - 15 = 20, ¿cuál es el valor de x?',
                options: [
                    { text: 'x = 1', correct: false },
                    { text: 'x = 7', correct: true },
                    { text: 'x = 35', correct: false },
                    { text: 'x = 5', correct: false }
                ],
                explanation: 'Sumamos 15 a ambos lados: 5x = 35. Dividimos entre 5: x = 7.'
            }
        },
        {
            id: 3,
            level: 'Intermedio',
            levelClass: 'tag-inter',
            title: '3. Polinomios y Factorización',
            desc: 'Factor común, trinomio cuadrado perfecto y diferencia de cuadrados.',
            theory: `
                <h3>Técnicas Fundamentales de Factorización</h3>
                <p>Factorizar es escribir una expresión algebraica como producto de factores más simples.</p>
                <div class="math-block">Casos Críticos:<br>• Diferencia de cuadrados: a² - b² = (a + b)(a - b)<br>• Factor común: ax + ay = a(x + y)<br>• Trinomio: x² + (p+q)x + pq = (x + p)(x + q)</div>
            `,
            practice: {
                question: 'Factoriza: x² - 9 y el trinomio x² + 5x + 6',
                steps: [
                    'Diferencia de cuadrados ➔ √x²=x, √9=3 ➔ (x + 3)(x - 3)',
                    'Trinomio x² + 5x + 6 ➔ Buscamos 2 números que multiplicados den 6 y sumados 5 (3 y 2)',
                    'Resultado ➔ (x + 3)(x + 2)'
                ]
            },
            quiz: {
                question: '¿Cómo se factoriza la expresión 4x² - 25?',
                options: [
                    { text: '(2x - 5)(2x - 5)', correct: false },
                    { text: '(2x + 5)(2x - 5)', correct: true },
                    { text: '(4x - 5)(x + 5)', correct: false },
                    { text: '(2x + 25)(2x - 1)', correct: false }
                ],
                explanation: 'Es una diferencia de cuadrados: √(4x²) = 2x y √25 = 5.'
            }
        },
        {
            id: 4,
            level: 'Avanzado',
            levelClass: 'tag-adv',
            title: '4. Ecuaciones Cuadráticas y Funciones',
            desc: 'Fórmula general, análisis del discriminante y comportamiento de parábolas.',
            theory: `
                <h3>Ecuaciones de Segundo Grado</h3>
                <p>Son ecuaciones donde el exponente mayor es 2. Poseen generalmente 2 soluciones (reales o complejas).</p>
                <div class="math-block">Fórmula General:<br>x = [ -b ± √(b² - 4ac) ] / (2a)</div>
                <p><strong>El Discriminante (Δ = b² - 4ac):</strong><br>• Si Δ > 0: Dos soluciones reales distintas.<br>• Si Δ = 0: Una única solución real.<br>• Si Δ < 0: Soluciones complejas/imaginarias.</p>
            `,
            practice: {
                question: 'Resuelve x² - 5x + 6 = 0 usando la fórmula general.',
                steps: [
                    'Identifica coeficientes: a = 1, b = -5, c = 6',
                    'Calcula discriminante: (-5)² - 4(1)(6) = 25 - 24 = 1',
                    'Aplica fórmula: x = [ 5 ± √1 ] / 2 ➔ x = [5 ± 1] / 2',
                    'Soluciones: x₁ = 3, x₂ = 2'
                ]
            },
            quiz: {
                question: '¿Cuántas soluciones reales tiene x² + 2x + 5 = 0?',
                options: [
                    { text: 'Dos soluciones reales', correct: false },
                    { text: 'Una única solución', correct: false },
                    { text: 'Cero soluciones reales (Complejas)', correct: true },
                    { text: 'Infinitas soluciones', correct: false }
                ],
                explanation: 'El discriminante b² - 4ac = (2)² - 4(1)(5) = 4 - 20 = -16. Al ser negativo, no hay soluciones reales.'
            }
        },
        {
            id: 5,
            level: 'Avanzado',
            levelClass: 'tag-adv',
            title: '5. Sistemas de Ecuaciones y Logaritmos',
            desc: 'Sistemas 2x2, método de sustitución/eliminación y propiedades de logaritmos.',
            theory: `
                <h3>Sistemas Lineales y Logaritmos</h3>
                <p>Un sistema busca los puntos de intersección entre múltiples ecuaciones simultáneas.</p>
                <div class="math-block">Definición de Logaritmo:<br>log_b(a) = c  ⟺  b^c = a<br><br>Propiedades:<br>• log(xy) = log(x) + log(y)<br>• log(x/y) = log(x) - log(y)</div>
            `,
            practice: {
                question: 'Resuelve el sistema: [1] x + y = 10, [2] x - y = 4',
                steps: [
                    'Método de suma/eliminación:',
                    'Suma ecuación [1] + [2]: (x+x) + (y-y) = 10 + 4',
                    '2x = 14 ➔ x = 7',
                    'Sustituye x en [1]: 7 + y = 10 ➔ y = 3',
                    'Solución ➔ (x=7, y=3)'
                ]
            },
            quiz: {
                question: '¿A qué es igual log₂(32)?',
                options: [
                    { text: '16', correct: false },
                    { text: '5', correct: true },
                    { text: '64', correct: false },
                    { text: '2.5', correct: false }
                ],
                explanation: 'Buscamos la potencia a la que elevamos la base 2 para obtener 32: 2⁵ = 32, por tanto log₂(32) = 5.'
            }
        }
    ];

    /* =========================================================
       2. APP STATE & PERSISTENCE
       ========================================================= */
    let userState = {
        completedModules: [],
        xp: 0,
        streak: 1,
        fatigueScore: 10, // 0 to 100
        studySeconds: 0
    };

    function loadState() {
        const saved = localStorage.getItem('algebraMasterState');
        if (saved) {
            userState = JSON.parse(saved);
        }
        updateUI();
    }

    function saveState() {
        localStorage.setItem('algebraMasterState', JSON.stringify(userState));
        updateUI();
    }

    function resetAllProgress() {
        if (confirm('¿Estás seguro de que deseas reiniciar todo tu progreso y estadísticas?')) {
            userState = {
                completedModules: [],
                xp: 0,
                streak: 1,
                fatigueScore: 10,
                studySeconds: 0
            };
            saveState();
        }
    }

    /* =========================================================
       3. FATIGUE CONTROL & POMODORO ENGINE
       ========================================================= */
    let timerInterval = null;
    let timerSecondsLeft = 25 * 60;
    let isTimerRunning = false;

    function initFatigueEngine() {
        // Ticks every second for the Pomodoro & mental fatigue calculation
        setInterval(() => {
            if (isTimerRunning) {
                userState.studySeconds += 1;
                timerSecondsLeft--;

                // Mental fatigue naturally increases slightly with prolonged continuous study
                if (userState.studySeconds % 120 === 0 && userState.fatigueScore < 95) {
                    userState.fatigueScore += 3;
                    saveState();
                }

                if (timerSecondsLeft <= 0) {
                    clearInterval(timerInterval);
                    isTimerRunning = false;
                    triggerFatigueAlert("¡Bloque de enfoque completado! Es momento obligatorio de una pausa activa.");
                    timerSecondsLeft = 25 * 60;
                }
                updateTimerDisplay();
            }
        }, 1000);
    }

    function toggleTimer() {
        isTimerRunning = !isTimerRunning;
        document.getElementById('btn-timer-toggle').textContent = isTimerRunning ? '⏸ Pausar' : '▶ Continuar';
        document.getElementById('btn-timer-toggle').className = isTimerRunning ? 'btn btn-primary' : 'btn btn-outline';
    }

    function updateTimerDisplay() {
        const mins = Math.floor(timerSecondsLeft / 60);
        const secs = timerSecondsLeft % 60;
        document.getElementById('timer-display').textContent = 
            `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function updateFatigueUI() {
        const fill = document.getElementById('fatigue-fill');
        const scoreText = document.getElementById('fatigue-score');
        const statusText = document.getElementById('fatigue-status');
        const score = userState.fatigueScore;

        scoreText.textContent = `${score}%`;
        fill.style.width = `${score}%`;

        if (score < 35) {
            fill.style.backgroundColor = 'var(--accent)';
            statusText.style.color = 'var(--accent)';
            statusText.textContent = 'Mente Fresca';
        } else if (score < 70) {
            fill.style.backgroundColor = 'var(--warning)';
            statusText.style.color = 'var(--warning)';
            statusText.textContent = 'Carga Media';
        } else {
            fill.style.backgroundColor = 'var(--danger)';
            statusText.style.color = 'var(--danger)';
            statusText.textContent = 'Fatiga Alta (Pausa)';
            
            // Alert user if fatigue hits dangerous levels
            if (score >= 85) {
                triggerFatigueAlert("Hemos detectado alta fatiga cognitiva. Tu retención disminuye un 60%. ¡Toma un respiro!");
            }
        }
    }

    function triggerFatigueAlert(msg) {
        showFatigueBreathingModal(msg);
    }

    /* =========================================================
       4. UI RENDERING & INTERACTION
       ========================================================= */
    function renderModules() {
        const container = document.getElementById('modules-container');
        container.innerHTML = '';

        algebraModules.forEach(mod => {
            const isCompleted = userState.completedModules.includes(mod.id);
            const card = document.createElement('div');
            card.className = 'module-card';
            card.innerHTML = `
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="module-tag ${mod.levelClass}">${mod.level}</span>
                        ${isCompleted ? '<span style="color: var(--accent); font-weight: 700; font-size: 0.85rem;">✓ Completado</span>' : ''}
                    </div>
                    <div class="module-info">
                        <h3>${mod.title}</h3>
                        <p>${mod.desc}</p>
                    </div>
                </div>
                <div class="module-actions">
                    <button class="btn btn-outline" onclick="openTheoryModal(${mod.id})">📖 Teoría</button>
                    <button class="btn btn-outline" onclick="openPracticeModal(${mod.id})">✏️ Práctica</button>
                    <button class="btn ${isCompleted ? 'btn-outline' : 'btn-primary'}" onclick="openQuizModal(${mod.id})">🎯 Evaluación</button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    function updateUI() {
        renderModules();
        updateFatigueUI();

        // Progress Bar
        const percent = Math.round((userState.completedModules.length / algebraModules.length) * 100);
        document.getElementById('global-progress-bar').style.width = `${percent}%`;
        document.getElementById('global-progress-percent').textContent = `${percent}%`;
        document.getElementById('modules-completed-text').textContent = `${userState.completedModules.length} de ${algebraModules.length} Módulos finalizados`;

        // Counters
        document.getElementById('xp-counter').textContent = `${userState.xp} XP`;
        document.getElementById('streak-counter').textContent = `${userState.streak} Día${userState.streak > 1 ? 's' : ''} Racha`;
    }

    /* =========================================================
       5. MODALS & EXERCISES HANDLERS
       ========================================================= */
    const modalContainer = document.getElementById('modal-container');
    const modalContent = document.getElementById('modal-content');

    function closeModal() {
        modalContainer.classList.remove('active');
    }

    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) closeModal();
    });

    function openTheoryModal(id) {
        const mod = algebraModules.find(m => m.id === id);
        modalContent.innerHTML = `
            <button class="modal-close" onclick="closeModal()">✕</button>
            <div style="margin-bottom: 20px;">
                <span class="module-tag ${mod.levelClass}">${mod.level}</span>
                <h2 style="margin-top: 8px;">${mod.title}</h2>
            </div>
            <div style="color: var(--text-muted); line-height: 1.6;">
                ${mod.theory}
            </div>
            <div style="margin-top: 24px; display: flex; justify-content: flex-end; gap: 10px;">
                <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
                <button class="btn btn-primary" onclick="openPracticeModal(${mod.id})">Ir a la Práctica Guiada ➔</button>
            </div>
        `;
        modalContainer.classList.add('active');
    }

    function openPracticeModal(id) {
        const mod = algebraModules.find(m => m.id === id);
        modalContent.innerHTML = `
            <button class="modal-close" onclick="closeModal()">✕</button>
            <h2 style="margin-bottom: 12px;">Actividad Práctica Guiada</h2>
            <p style="color: var(--text-muted); margin-bottom: 16px;">Analiza paso a paso la resolución del siguiente problema:</p>
            
            <div style="background: rgba(0,0,0,0.3); padding: 16px; border-radius: var(--radius-sm); margin-bottom: 20px; border: 1px solid var(--border-color);">
                <strong style="color: #fff; font-size: 1.05rem;">Problema:</strong>
                <p style="margin-top: 6px; font-family: 'Fira Code', monospace; color: var(--primary-light);">${mod.practice.question}</p>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px;">
                ${mod.practice.steps.map(step => `
                    <div style="padding: 10px 14px; background: rgba(255,255,255,0.03); border-left: 3px solid var(--accent); border-radius: 4px; font-size: 0.9rem;">
                        ${step}
                    </div>
                `).join('')}
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button class="btn btn-outline" onclick="openTheoryModal(${mod.id})">⬅ Volver a Teoría</button>
                <button class="btn btn-accent" onclick="openQuizModal(${mod.id})">Tomar Evaluación (+50 XP) ➔</button>
            </div>
        `;
        modalContainer.classList.add('active');
    }

    function openQuizModal(id) {
        const mod = algebraModules.find(m => m.id === id);
        modalContent.innerHTML = `
            <button class="modal-close" onclick="closeModal()">✕</button>
            <div style="margin-bottom: 18px;">
                <span class="module-tag ${mod.levelClass}">Evaluación de Módulo</span>
                <h2 style="margin-top: 8px;">${mod.title}</h2>
            </div>
            
            <div style="background: rgba(0,0,0,0.3); padding: 18px; border-radius: var(--radius-sm); margin-bottom: 20px;">
                <p style="font-size: 1.05rem; font-weight: 600;">${mod.quiz.question}</p>
            </div>

            <div id="quiz-options-container">
                ${mod.quiz.options.map((opt, idx) => `
                    <div class="quiz-option" onclick="evaluateQuizAnswer(${id}, ${idx})">
                        <span style="font-family: 'Fira Code'; color: var(--text-muted); font-weight: 700;">${String.fromCharCode(65 + idx)})</span>
                        <span>${opt.text}</span>
                    </div>
                `).join('')}
            </div>

            <div id="quiz-feedback" style="margin-top: 18px; display: none;"></div>
        `;
        modalContainer.classList.add('active');
    }

    function evaluateQuizAnswer(moduleId, selectedIdx) {
        const mod = algebraModules.find(m => m.id === moduleId);
        const selected = mod.quiz.options[selectedIdx];
        const feedbackBox = document.getElementById('quiz-feedback');
        const optionEls = document.querySelectorAll('.quiz-option');

        optionEls.forEach(el => el.style.pointerEvents = 'none');

        if (selected.correct) {
            optionEls[selectedIdx].classList.add('correct');
            feedbackBox.innerHTML = `
                <div style="padding: 14px; background: rgba(16,185,129,0.15); border: 1px solid var(--accent); border-radius: var(--radius-sm); color: #a7f3d0;">
                    <strong>¡Excelente y Correcto! 🎉 (+50 XP)</strong>
                    <p style="font-size: 0.88rem; margin-top: 4px;">${mod.quiz.explanation}</p>
                </div>
                <button class="btn btn-accent" style="width: 100%; margin-top: 14px;" onclick="completeModule(${moduleId})">Guardar Progreso y Continuar</button>
            `;
        } else {
            optionEls[selectedIdx].classList.add('incorrect');
            // Highlight the correct one
            mod.quiz.options.forEach((opt, idx) => {
                if (opt.correct) optionEls[idx].classList.add('correct');
            });

            feedbackBox.innerHTML = `
                <div style="padding: 14px; background: rgba(239,68,68,0.15); border: 1px solid var(--danger); border-radius: var(--radius-sm); color: #fca5a5;">
                    <strong>No del todo correcto</strong>
                    <p style="font-size: 0.88rem; margin-top: 4px;">${mod.quiz.explanation}</p>
                </div>
                <button class="btn btn-outline" style="width: 100%; margin-top: 14px;" onclick="openQuizModal(${moduleId})">Reintentar</button>
            `;
            // Small fatigue penalty on errors
            userState.fatigueScore = Math.min(100, userState.fatigueScore + 5);
        }
        feedbackBox.style.display = 'block';
    }

    function completeModule(id) {
        if (!userState.completedModules.includes(id)) {
            userState.completedModules.push(id);
            userState.xp += 50;
        }
        // Small mental fatigue increase due to evaluation
        userState.fatigueScore = Math.min(100, userState.fatigueScore + 8);
        saveState();
        closeModal();
    }

    /* =========================================================
       6. ANTI-FATIGUE & RELAXATION MODAL
       ========================================================= */
    function showFatigueBreathingModal(customMsg = null) {
        modalContent.innerHTML = `
            <button class="modal-close" onclick="closeModal()">✕</button>
            <div style="text-align: center; margin-bottom: 12px;">
                <span class="module-tag" style="background: rgba(99,102,241,0.2); color: #a5b4fc;">Recuperación Cerebral</span>
                <h2 style="margin-top: 8px;">Pausa Activa Anti-Fatiga</h2>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 6px;">
                    ${customMsg ? customMsg : 'Sincroniza tu respiración con el círculo. Inhala cuando se expanda, exhala cuando se contraiga.'}
                </p>
            </div>

            <div class="breath-container">
                <div class="breath-circle">
                    <span>Respira</span>
                </div>
                <p style="font-size: 0.85rem; color: var(--accent);">Técnica 4-4-4: Calma la corteza prefrontal</p>
            </div>

            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button class="btn btn-outline" style="flex: 1;" onclick="closeModal()">Cerrar</button>
                <button class="btn btn-accent" style="flex: 1;" onclick="resetFatigueScore()">✓ Me siento renovado (-35% Fatiga)</button>
            </div>
        `;
        modalContainer.classList.add('active');
    }

    function resetFatigueScore() {
        userState.fatigueScore = Math.max(5, userState.fatigueScore - 35);
        timerSecondsLeft = 25 * 60;
        saveState();
        closeModal();
    }

    function showQuickDiagnostic() {
        modalContent.innerHTML = `
            <button class="modal-close" onclick="closeModal()">✕</button>
            <h2>🎯 Test de Nivel Diagnóstico</h2>
            <p style="color: var(--text-muted); margin: 8px 0 20px 0;">¿Cuál de estos temas dominas con total seguridad?</p>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <button class="btn btn-outline" style="justify-content: flex-start; padding: 14px;" onclick="selectDiagnosticLevel(1)">
                    🌱 Nivel 0: Sé sumar/restar pero me confunden las letras (Módulo 1).
                </button>
                <button class="btn btn-outline" style="justify-content: flex-start; padding: 14px;" onclick="selectDiagnosticLevel(3)">
                    🌿 Nivel Medio: Sé despejar la 'x' básica pero me cuesta factorizar (Módulo 3).
                </button>
                <button class="btn btn-outline" style="justify-content: flex-start; padding: 14px;" onclick="selectDiagnosticLevel(4)">
                    🚀 Nivel Alto: Busco dominar cuadráticas, sistemas y logaritmos (Módulo 4 y 5).
                </button>
            </div>
        `;
        modalContainer.classList.add('active');
    }

    function selectDiagnosticLevel(targetModuleId) {
        closeModal();
        openTheoryModal(targetModuleId);
    }

    /* =========================================================
       7. INITIALIZATION
       ========================================================= */
    document.getElementById('btn-timer-toggle').addEventListener('click', toggleTimer);
    document.getElementById('btn-force-break').addEventListener('click', () => showFatigueBreathingModal());

    window.onload = () => {
        loadState();
        initFatigueEngine();
        updateTimerDisplay();
    };