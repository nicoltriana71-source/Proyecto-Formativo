// --- CURRICULUM DATA ---
    const curriculum = [
        {
            id: "mod-1",
            title: "Módulo 1: Fundamentos de IA y Conexión Relacional (Básico)",
            subtitle: "Conectores nativos, drivers, ORMs y esquemas de base de datos para LLMs",
            badge: "badge-basic",
            level: "Básico",
            lessons: [
                { id: "l1", title: "Conexión a Bases de Datos (PostgreSQL/MySQL) con Python y SQLAlchemy", type: "theory" },
                { id: "l2", title: "Generación segura de prompts con Esquema DDL (System Prompting)", type: "code", code: "# Ejemplo de inyección de esquema DDL en Prompt\ncontext = f'DATABASE SCHEMA:\\n{db.get_schema()}\\nGenerate valid SQL:'" },
                { id: "l3", title: "Actividad Práctica: Implementar un traductor Text-to-SQL simple", type: "practice" }
            ],
            evaluation: {
                question: "¿Cuál es la práctica más crítica al enviar un esquema de base de datos a un LLM para Text-to-SQL?",
                options: [
                    { text: "Enviar toda la base de datos con los datos sensibles incluidos", correct: false },
                    { text: "Enviar únicamente el DDL (tablas, columnas, tipos y llaves foráneas) sin datos confidenciales", correct: true },
                    { text: "No enviar ningún esquema y dejar que el LLM adivine los nombres", correct: false },
                    { text: "Ejecutar las consultas directamente con permisos de usuario 'root'", correct: false }
                ],
                explanation: "Enviar únicamente el DDL permite al modelo conocer la estructura relacional exacta sin exponer datos privados de los usuarios."
            }
        },
        {
            id: "mod-2",
            title: "Módulo 2: Embeddings y Bases de Datos Vectoriales (Intermedio)",
            subtitle: "Representación semántica, indexación HNSW/IVFFlat y pgvector / ChromaDB",
            badge: "badge-intermediate",
            level: "Intermedio",
            lessons: [
                { id: "l4", title: "Matemática de Embeddings: Distancia Coseno, Euclidiana y Producto Punto", type: "theory" },
                { id: "l5", title: "Configurar extensión pgvector en PostgreSQL y crear índices HNSW", type: "code", code: "CREATE EXTENSION vector;\nCREATE TABLE items (id bigserial, embedding vector(1536));\nCREATE INDEX ON items USING hnsw (embedding vector_cosine_ops);" },
                { id: "l6", title: "Actividad Práctica: Búsqueda Semántica de documentos en ChromaDB", type: "practice" }
            ],
            evaluation: {
                question: "¿Por qué se utiliza el algoritmo HNSW (Hierarchical Navigable Small World) en bases de datos vectoriales?",
                options: [
                    { text: "Para comprimir archivos PDF a formato ZIP", correct: false },
                    { text: "Para realizar búsquedas de vecinos más cercanos aproximados (ANN) en milisegundos a gran escala", correct: true },
                    { text: "Para encriptar contraseñas de usuarios", correct: false },
                    { text: "Para convertir bases de datos NoSQL a relacionales", correct: false }
                ],
                explanation: "HNSW crea un grafo multicapa que permite encontrar los vectores más cercanos sin escanear exhaustivamente toda la base de datos."
            }
        },
        {
            id: "mod-3",
            title: "Módulo 3: Arquitecturas RAG & Pipelines con LlamaIndex y LangChain (Intermedio-Avanzado)",
            subtitle: "Chunking inteligente, Re-Ranking, Hybrid Search y gestión de memoria contextual",
            badge: "badge-advanced",
            level: "Intermedio-Avanzado",
            lessons: [
                { id: "l7", title: "Estrategias de Chunking: Fixed-size vs Semantic Chunking", type: "theory" },
                { id: "l8", title: "Búsqueda Híbrida: Combinando BM25 (Keyword) + Búsqueda Vectorial", type: "code", code: "hybrid_retriever = BM25Retriever(dense_retriever, alpha=0.5)\nresults = hybrid_retriever.get_relevant_documents(query)" },
                { id: "l9", title: "Actividad Práctica: RAG con Re-Ranking utilizando Cohere / Cross-Encoders", type: "practice" }
            ],
            evaluation: {
                question: "¿Qué problema resuelve principalmente la 'Búsqueda Híbrida' en sistemas RAG?",
                options: [
                    { text: "Reduce el costo de la factura de internet", correct: false },
                    { text: "Compensa la debilidad del vector para encontrar palabras clave exactas (IDs, nombres propios) combinándolo con BM25", correct: true },
                    { text: "Elimina la necesidad de usar una base de datos", correct: false },
                    { text: "Traduce texto automáticamente a 50 idiomas", correct: false }
                ],
                explanation: "La búsqueda semántica a veces falla en números de modelo o códigos de serie; BM25 rescata esas palabras clave precisas."
            }
        },
        {
            id: "mod-4",
            title: "Módulo 4: Agentes Autónomos, SQL Seguro y Sandboxing (Avanzado)",
            subtitle: "Ciclos ReAct, mitigación de Prompt Injection, Read-Only sandboxes y Semantic Caching",
            badge: "badge-master",
            level: "Avanzado",
            lessons: [
                { id: "l10", title: "Patrón ReAct (Reason + Act): Agentes con herramientas de consulta SQL", type: "theory" },
                { id: "l11", title: "Blindaje de Seguridad: Sanitización AST, cuotas de ejecución y usuarios Read-Only", type: "code", code: "-- Crear usuario exclusivo para Agente IA\nCREATE USER ai_agent WITH PASSWORD '...';\nGRANT SELECT ON ALL TABLES IN SCHEMA public TO ai_agent;" },
                { id: "l12", title: "Actividad Práctica: Implementar Semantic Cache con Redis para reducir 80% tokens", type: "practice" }
            ],
            evaluation: {
                question: "¿Cuál es la medida de seguridad indispensable al permitir que un agente de IA ejecute consultas en una BD productiva?",
                options: [
                    { text: "Confiar plenamente en que el LLM no generará comandos 'DROP TABLE'", correct: false },
                    { text: "Conectar con credenciales de superusuario para evitar errores de permisos", correct: false },
                    { text: "Usar roles de solo lectura (READ-ONLY), validación AST y límites de 'LIMIT / TIMEOUT'", correct: true },
                    { text: "Guardar las contraseñas en el prompt del sistema", correct: false }
                ],
                explanation: "El principio de privilegio mínimo (Least Privilege) con transacciones de solo lectura y timeouts es mandatorio para prevenir inyecciones o borrado accidental."
            }
        },
        {
            id: "mod-5",
            title: "Módulo 5: Pipelines en Tiempo Real (CDC) y Evaluación RAGOps (Maestría)",
            subtitle: "Change Data Capture (Debezium/Kafka), sincronización continua y métricas Ragas",
            badge: "badge-master",
            level: "Maestría",
            lessons: [
                { id: "l13", title: "Sincronización en Streaming con Change Data Capture (CDC) hacia la Base Vectorial", type: "theory" },
                { id: "l14", title: "Evaluación con Ragas: Faithfulness, Answer Relevance y Context Precision", type: "theory" },
                { id: "l15", title: "Proyecto Final: Construcción de un Copilot Empresarial conectado a BD Híbrida", type: "practice" }
            ],
            evaluation: {
                question: "En el framework de evaluación Ragas, ¿qué mide la métrica 'Faithfulness' (Fidelidad)?",
                options: [
                    { text: "La velocidad de respuesta de la tarjeta gráfica", correct: false },
                    { text: "Si la respuesta generada se basa estrictamente en el contexto recuperado sin alucinaciones", correct: true },
                    { text: "El tamaño en megabytes de la base de datos", correct: false },
                    { text: "La cantidad de tokens consumidos en el embedding", correct: false }
                ],
                explanation: "Faithfulness verifica que todas las afirmaciones en la respuesta del modelo provengan directamente de los documentos encontrados en la base de datos."
            }
        }
    ];

    // --- STATE MANAGEMENT ---
    let userState = {
        completedLessons: JSON.parse(localStorage.getItem('ai_db_completed_lessons')) || [],
        xp: parseInt(localStorage.getItem('ai_db_xp')) || 0,
        minutesStudied: parseInt(localStorage.getItem('ai_db_mins')) || 0,
        fatigueEnergy: 100
    };

    // --- FATIGUE & TIMER STATE ---
    let timerDuration = 25 * 60; // 25 min default
    let timeRemaining = timerDuration;
    let timerInterval = null;
    let isTimerRunning = false;
    let continuousSecondsStudied = 0;

    // --- INITIALIZATION ---
    document.addEventListener('DOMContentLoaded', () => {
        lucide.createIcons();
        renderModules();
        updateProgressUI();
        updateFatigueUI();
    });

    // --- RENDER MODULES ---
    function renderModules() {
        const container = document.getElementById('modules-list');
        container.innerHTML = '';

        curriculum.forEach((mod, index) => {
            const isCompleted = mod.lessons.every(l => userState.completedLessons.includes(l.id));
            const card = document.createElement('div');
            card.className = `module-card ${index === 0 ? 'expanded' : ''}`;
            card.id = mod.id;

            card.innerHTML = `
                <div class="module-header" onclick="toggleModule('${mod.id}')">
                    <div class="module-title-area">
                        <div class="module-num">${index + 1}</div>
                        <div>
                            <span class="badge ${mod.badge}">${mod.level}</span>
                            <h3>${mod.title}</h3>
                            <p>${mod.subtitle}</p>
                        </div>
                    </div>
                    <i data-lucide="chevron-down" class="chevron-icon"></i>
                </div>

                <div class="module-content">
                    <div class="module-section-title">Contenido y Actividades Prácticas</div>
                    <ul class="lesson-list">
                        ${mod.lessons.map(lesson => {
                            const done = userState.completedLessons.includes(lesson.id);
                            return `
                                <li class="lesson-item">
                                    <div class="lesson-left">
                                        <div class="checkbox-custom ${done ? 'checked' : ''}" onclick="toggleLesson('${lesson.id}', 50)">
                                            ${done ? '<i data-lucide="check" style="width: 14px; height: 14px;"></i>' : ''}
                                        </div>
                                        <div>
                                            <span class="lesson-text ${done ? 'done' : ''}">${lesson.title}</span>
                                            ${lesson.code ? `<div class="code-box">${escapeHtml(lesson.code)}</div>` : ''}
                                        </div>
                                    </div>
                                    <span class="badge" style="background: rgba(255,255,255,0.05); color: var(--text-dim);">+50 XP</span>
                                </li>
                            `;
                        }).join('')}
                    </ul>

                    <div class="eval-banner">
                        <div class="eval-banner-text">
                            <h4>Checkpoint de Validación</h4>
                            <p>Pon a prueba tus conocimientos para desbloquear maestría.</p>
                        </div>
                        <button class="btn btn-outline btn-sm" onclick="openQuiz('${mod.id}')">
                            <i data-lucide="help-circle"></i> Iniciar Evaluación
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
        lucide.createIcons();
    }

    function toggleModule(modId) {
        const card = document.getElementById(modId);
        card.classList.toggle('expanded');
    }

    function toggleLesson(lessonId, xpGain) {
        if (userState.completedLessons.includes(lessonId)) {
            userState.completedLessons = userState.completedLessons.filter(id => id !== lessonId);
            userState.xp = Math.max(0, userState.xp - xpGain);
        } else {
            userState.completedLessons.push(lessonId);
            userState.xp += xpGain;
            playChime();
        }
        saveState();
        renderModules();
        updateProgressUI();
    }

    function saveState() {
        localStorage.setItem('ai_db_completed_lessons', JSON.stringify(userState.completedLessons));
        localStorage.setItem('ai_db_xp', userState.xp.toString());
        localStorage.setItem('ai_db_mins', userState.minutesStudied.toString());
    }

    // --- PROGRESS CALCULATION ---
    function updateProgressUI() {
        const totalLessons = curriculum.reduce((acc, m) => acc + m.lessons.length, 0);
        const completed = userState.completedLessons.length;
        const pct = Math.round((completed / totalLessons) * 100);

        document.getElementById('main-progress-bar').style.width = pct + '%';
        document.getElementById('progress-percentage-text').innerText = pct + '%';
        document.getElementById('completed-tasks-count').innerText = completed;
        document.getElementById('xp-points').innerText = userState.xp;
        document.getElementById('total-time-today').innerText = `${userState.minutesStudied} min`;
    }

    // --- FATIGUE & TIMER ENGINE ---
    function updateTimerDisplay() {
        const mins = Math.floor(timeRemaining / 60);
        const secs = timeRemaining % 60;
        document.getElementById('study-timer').innerText = 
            `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function toggleTimer() {
        if (isTimerRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    }

    function startTimer() {
        isTimerRunning = true;
        document.getElementById('timer-btn-text').innerText = "Pausar";
        document.getElementById('timer-icon').setAttribute('data-lucide', 'pause');
        lucide.createIcons();

        timerInterval = setInterval(() => {
            if (timeRemaining > 0) {
                timeRemaining--;
                continuousSecondsStudied++;
                
                // Track total minutes
                if (continuousSecondsStudied % 60 === 0) {
                    userState.minutesStudied++;
                    saveState();
                    updateProgressUI();
                }

                // Fatigue calculation: drops 1% every ~45 seconds of continuous focus
                if (continuousSecondsStudied % 45 === 0 && userState.fatigueEnergy > 10) {
                    userState.fatigueEnergy -= 1;
                    updateFatigueUI();
                }

                updateTimerDisplay();
            } else {
                // Timer finished -> trigger Fatigue Break
                pauseTimer();
                triggerBreakModal();
            }
        }, 1000);
    }

    function pauseTimer() {
        isTimerRunning = false;
        clearInterval(timerInterval);
        document.getElementById('timer-btn-text').innerText = "Reanudar";
        document.getElementById('timer-icon').setAttribute('data-lucide', 'play');
        lucide.createIcons();
    }

    function resetTimer() {
        pauseTimer();
        timeRemaining = 25 * 60;
        continuousSecondsStudied = 0;
        updateTimerDisplay();
    }

    function updateFatigueUI() {
        const energy = userState.fatigueEnergy;
        document.getElementById('energy-percentage').innerText = `${energy}%`;

        // SVG circle dashoffset
        const circle = document.getElementById('fatigue-dial-bar');
        const circumference = 2 * Math.PI * 60; // r=60 -> ~377
        const offset = circumference - (energy / 100) * circumference;
        circle.style.strokeDashoffset = offset;

        const badge = document.getElementById('fatigue-badge');
        const statusText = document.getElementById('fatigue-status-text');
        const hintText = document.getElementById('fatigue-hint');

        if (energy > 75) {
            circle.style.stroke = "var(--success)";
            badge.className = "badge badge-basic";
            badge.innerText = "Nivel de Energía: Óptimo";
            statusText.innerText = "Alta capacidad de asimilación";
            statusText.style.color = "var(--success)";
            hintText.innerText = "Excelente momento para conceptos teóricos densos y arquitecturas.";
        } else if (energy > 40) {
            circle.style.stroke = "var(--warning)";
            badge.className = "badge badge-master";
            badge.innerText = "Nivel de Energía: Medio";
            statusText.innerText = "Fatiga leve detectada";
            statusText.style.color = "var(--warning)";
            hintText.innerText = "Recomendado pasar a ejercicios prácticos de código para mantener agilidad.";
        } else {
            circle.style.stroke = "var(--danger)";
            badge.className = "badge badge-advanced";
            badge.innerText = "Nivel de Energía: Crítico";
            statusText.innerText = "Fatiga Cognitiva Alta";
            statusText.style.color = "var(--danger)";
            hintText.innerText = "¡Haz una pausa de 5 minutos! Tu retención está decayendo.";
        }
    }

    function triggerBreakModal() {
        document.getElementById('break-modal').classList.add('active');
        playAlertSound();
    }

    function completeBreak() {
        document.getElementById('break-modal').classList.remove('active');
        userState.fatigueEnergy = 100;
        continuousSecondsStudied = 0;
        timeRemaining = 25 * 60;
        updateFatigueUI();
        updateTimerDisplay();
    }

    // --- QUIZ SYSTEM ---
    function openQuiz(moduleId) {
        const mod = curriculum.find(m => m.id === moduleId);
        if (!mod) return;

        const modal = document.getElementById('quiz-modal');
        document.getElementById('quiz-module-badge').innerText = `Evaluación: ${mod.level}`;
        document.getElementById('quiz-question').innerText = mod.evaluation.question;
        
        const optionsContainer = document.getElementById('quiz-options-container');
        optionsContainer.innerHTML = '';

        const feedback = document.getElementById('quiz-feedback');
        feedback.style.display = 'none';
        document.getElementById('quiz-next-btn').style.display = 'none';

        mod.evaluation.options.forEach((opt, idx) => {
            const btn = document.createElement('div');
            btn.className = 'quiz-option';
            btn.innerHTML = `<span>${opt.text}</span><i data-lucide="circle" style="width: 18px;"></i>`;
            btn.onclick = () => selectQuizOption(btn, opt, mod.evaluation);
            optionsContainer.appendChild(btn);
        });

        modal.classList.add('active');
        lucide.createIcons();
    }

    function selectQuizOption(element, option, evalData) {
        const allOptions = document.querySelectorAll('.quiz-option');
        allOptions.forEach(op => op.onclick = null); // disable clicks

        const feedback = document.getElementById('quiz-feedback');
        feedback.style.display = 'block';

        if (option.correct) {
            element.classList.add('correct');
            feedback.innerHTML = `<span style="color: var(--success); font-weight: 700;">¡Correcto! +100 XP</span><br><p style="color: var(--text-muted); margin-top:4px;">${evalData.explanation}</p>`;
            userState.xp += 100;
            saveState();
            updateProgressUI();
            playChime();
        } else {
            element.classList.add('wrong');
            feedback.innerHTML = `<span style="color: var(--danger); font-weight: 700;">Respuesta incorrecta</span><br><p style="color: var(--text-muted); margin-top:4px;">${evalData.explanation}</p>`;
        }

        document.getElementById('quiz-next-btn').style.display = 'inline-flex';
    }

    function closeModal(id) {
        document.getElementById(id).classList.remove('active');
    }

    // --- UTILS & AUDIO FEEDBACK ---
    function escapeHtml(text) {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function playChime() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2); // A5
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } catch(e) {}
    }

    function playAlertSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
        } catch(e) {}
    }