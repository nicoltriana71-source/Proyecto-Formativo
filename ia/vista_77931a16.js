// ================== DATOS DEL CURRÍCULO (BÁSICO -> AVANZADO) ==================
        const syllabusData = [
            {
                id: 1,
                title: "Módulo 1: Fundamentos y Modelo Relacional",
                level: "Básico",
                badgeClass: "badge-basic",
                desc: "Conceptos esenciales de bases de datos relacionales, arquitectura, tablas, campos y claves primarias.",
                lessons: [
                    { id: "1.1", title: "Introducción a Sistemas de Gestión de BD (RDBMS)", duration: "25 min", xp: 30, activity: "Identificar diferencias entre archivos planos y una base de datos ACID." },
                    { id: "1.2", title: "DDL Básico: Creación de Tablas y Tipos de Datos", duration: "35 min", xp: 40, activity: "Escribir un script CREATE TABLE con restricciones NOT NULL y UNIQUE.", code: "CREATE TABLE usuarios (\n  id INT PRIMARY KEY AUTO_INCREMENT,\n  nombre VARCHAR(80) NOT NULL,\n  email VARCHAR(120) UNIQUE\n);" },
                    { id: "1.3", title: "DML Básico: SELECT, INSERT, UPDATE, DELETE", duration: "40 min", xp: 50, activity: "Realizar consultas con filtros WHERE y operadores lógicos AND / OR.", code: "SELECT nombre, email FROM usuarios WHERE id >= 10 AND activo = 1;" }
                ]
            },
            {
                id: 2,
                title: "Módulo 2: Modelado Entidad-Relación y Normalización",
                level: "Intermedio",
                badgeClass: "badge-mid",
                desc: "Diseño esquemático robusto, relaciones 1:1, 1:N, N:M y formas normales (1FN, 2FN, 3FN).",
                lessons: [
                    { id: "2.1", title: "Diseño Conceptual: Diagramas ERD y Cardinalidad", duration: "30 min", xp: 45, activity: "Diseñar el esquema de un sistema de comercio electrónico (Clientes, Pedidos, Productos)." },
                    { id: "2.2", title: "Normalización de Datos: De 1FN hasta 3FN", duration: "45 min", xp: 60, activity: "Eliminar redundancias y dependencias transitivas en una tabla desnormalizada.", code: "-- 3FN: Eliminar dependencias transitivas\n-- Separar datos de Ciudad y Código Postal en tabla propia." },
                    { id: "2.3", title: "Integridad Referencial y Claves Foráneas (FK)", duration: "35 min", xp: 50, activity: "Configurar acciones en cascada ON DELETE CASCADE / SET NULL." }
                ]
            },
            {
                id: 3,
                title: "Módulo 3: Consultas Complejas, JOINs y Agregaciones",
                level: "Intermedio Alto",
                badgeClass: "badge-mid",
                desc: "Dominio de cruces de datos, funciones de agregación, subconsultas y ordenamiento avanzado.",
                lessons: [
                    { id: "3.1", title: "INNER JOIN, LEFT/RIGHT JOIN y FULL OUTER JOIN", duration: "45 min", xp: 60, activity: "Unir 3 tablas relacionales para extraer un reporte de ventas por cliente.", code: "SELECT u.nombre, p.total FROM usuarios u \nINNER JOIN pedidos p ON u.id = p.usuario_id;" },
                    { id: "3.2", title: "Agrupamiento con GROUP BY y Cláusula HAVING", duration: "40 min", xp: 50, activity: "Calcular el promedio de ventas por categoría filtrando grupos con HAVING.", code: "SELECT categoria, COUNT(*), AVG(precio) \nFROM productos GROUP BY categoria HAVING AVG(precio) > 50;" },
                    { id: "3.3", title: "Subconsultas correlacionadas y CTEs (WITH)", duration: "50 min", xp: 70, activity: "Crear una Common Table Expression para segmentar usuarios de alto valor." }
                ]
            },
            {
                id: 4,
                title: "Módulo 4: Optimización, Índices y Transacciones ACID",
                level: "Avanzado",
                badgeClass: "badge-adv",
                desc: "Análisis de planes de ejecución, creación estratégica de índices B-Tree/Hash y control de concurrencia.",
                lessons: [
                    { id: "4.1", title: "Estructura de Índices B-Tree vs Hash", duration: "40 min", xp: 65, activity: "Crear índices compuestos y medir el impacto con EXPLAIN ANALYZE.", code: "EXPLAIN ANALYZE SELECT * FROM facturas WHERE cliente_id = 45 AND fecha >= '2024-01-01';" },
                    { id: "4.2", title: "Transacciones, Niveles de Aislamiento y Locks", duration: "50 min", xp: 75, activity: "Simular problemas de lectura fantasma y bloqueo pesimista/optimista.", code: "START TRANSACTION;\nUPDATE cuentas SET saldo = saldo - 100 WHERE id = 1;\nUPDATE cuentas SET saldo = saldo + 100 WHERE id = 2;\nCOMMIT;" },
                    { id: "4.3", title: "Procedimientos Almacenados, Triggers y Vistas", duration: "45 min", xp: 60, activity: "Construir un Trigger para auditoría automática de cambios salariales." }
                ]
            },
            {
                id: 5,
                title: "Módulo 5: NoSQL, Replicación y Arquitectura Distribuida",
                level: "Experto",
                badgeClass: "badge-exp",
                desc: "Modelos Documentales (MongoDB), Clave-Valor (Redis), Teorema CAP, Sharding y Alta Disponibilidad.",
                lessons: [
                    { id: "5.1", title: "Bases de Datos NoSQL: Modelo Documental y Clave-Valor", duration: "50 min", xp: 70, activity: "Modelar documentos embebidos vs referencias en MongoDB y caché en Redis." },
                    { id: "5.2", title: "Teorema CAP, Consistencia Eventual y Sharding", duration: "55 min", xp: 80, activity: "Diseñar una estrategia de particionamiento horizontal (Sharding Key)." },
                    { id: "5.3", title: "Replicación Leader-Follower y Failover", duration: "60 min", xp: 90, activity: "Configurar un clúster con réplicas de solo lectura para balanceo de carga." }
                ]
            }
        ];

        // ================== BANCO DE PREGUNTAS (EVALUACIÓN) ==================
        const quizBank = [
            {
                question: "¿Cuál es la función principal de la cláusula HAVING en SQL?",
                options: [
                    "Reemplazar a la cláusula WHERE para filtros de texto.",
                    "Filtrar filas resultantes después de una agregación con GROUP BY.",
                    "Crear un índice temporal en memoria.",
                    "Ordenar los datos en forma ascendente o descendente."
                ],
                correct: 1,
                module: "Módulo 3: Consultas Complejas"
            },
            {
                question: "En una base de datos relacional, ¿qué asegura la propiedad 'Atomicity' de ACID?",
                options: [
                    "Que las operaciones se completen totalmente o no se ejecute ninguna.",
                    "Que los datos sean visibles de inmediato por otros usuarios en todo momento.",
                    "Que los datos se almacenen en formato JSON.",
                    "Que la base de datos nunca use disco duro."
                ],
                correct: 0,
                module: "Módulo 4: Optimización & ACID"
            },
            {
                question: "¿Cuál es el propósito principal de la Tercera Forma Normal (3FN)?",
                options: [
                    "Eliminar cualquier clave foránea duplicada.",
                    "Garantizar que no existan dependencias funcionales transitivas.",
                    "Evitar tener más de 10 columnas por tabla.",
                    "Convertir datos relacionales a formato de grafos."
                ],
                correct: 1,
                module: "Módulo 2: Normalización"
            },
            {
                question: "¿Qué postula el Teorema CAP para sistemas distribuidos?",
                options: [
                    "Un sistema puede garantizar simultáneamente Consistencia, Disponibilidad y Tolerancia a Particiones.",
                    "Solo se pueden garantizar simultáneamente 2 de las 3 propiedades ante una partición de red.",
                    "La capacidad de procesamiento se duplica cada 18 meses.",
                    "Las claves primarias deben ser siempre números enteros."
                ],
                correct: 1,
                module: "Módulo 5: Arquitectura Distribuida"
            }
        ];

        // ================== ESTADO DE LA APLICACIÓN ==================
        let appState = {
            completedLessons: JSON.parse(localStorage.getItem('db_completed_lessons')) || [],
            xp: parseInt(localStorage.getItem('db_xp')) || 0,
            secondsStudied: parseInt(localStorage.getItem('db_study_seconds')) || 0,
            fatigueLevel: 10, // 0 a 100
            currentQuizIndex: 0
        };

        // ================== INICIALIZACIÓN ==================
        document.addEventListener('DOMContentLoaded', () => {
            renderRoadmap();
            updateGlobalMetrics();
            initQuiz();
            startContinuousFatigueEngine();
        });

        // ================== RENDERIZADO DEL ROADMAP ==================
        function renderRoadmap() {
            const container = document.getElementById('modulesContainer');
            container.innerHTML = '';

            let totalLessons = 0;

            syllabusData.forEach((mod, index) => {
                totalLessons += mod.lessons.length;
                const isOpen = index === 0 ? 'open' : '';

                const moduleHtml = `
                    <div class="module-card ${isOpen}" id="module-${mod.id}">
                        <div class="module-header" onclick="toggleModule(${mod.id})">
                            <div>
                                <span class="module-badge ${mod.badgeClass}">${mod.level}</span>
                                <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 4px;">${mod.title}</h3>
                                <p style="font-size: 0.85rem; color: var(--text-muted);">${mod.desc}</p>
                            </div>
                            <i class="fa-solid fa-chevron-down chevron-icon" style="color: var(--text-muted);"></i>
                        </div>
                        <div class="module-content">
                            <div class="lessons-list">
                                ${mod.lessons.map(lesson => {
                                    const isDone = appState.completedLessons.includes(lesson.id);
                                    return `
                                        <div class="lesson-item ${isDone ? 'completed' : ''}" id="lesson-${lesson.id}">
                                            <div class="lesson-left">
                                                <button class="lesson-checkbox" onclick="toggleLesson('${lesson.id}', ${lesson.xp})">
                                                    <i class="fa-solid fa-check"></i>
                                                </button>
                                                <div>
                                                    <div style="font-weight: 600; font-size: 0.95rem;">${lesson.id} - ${lesson.title}</div>
                                                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                                                        <i class="fa-regular fa-clock"></i> ${lesson.duration} • 
                                                        <i class="fa-solid fa-star" style="color: var(--warning);"></i> +${lesson.xp} XP
                                                    </div>
                                                    <div style="font-size: 0.82rem; color: #94A3B8; margin-top: 6px; background: rgba(0,0,0,0.2); padding: 6px 10px; border-radius: 6px;">
                                                        <strong>Actividad:</strong> ${lesson.activity}
                                                    </div>
                                                    ${lesson.code ? `<div class="code-box">${escapeHtml(lesson.code)}</div>` : ''}
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', moduleHtml);
            });

            document.getElementById('totalLessonsCount').innerText = totalLessons;
        }

        function toggleModule(id) {
            const card = document.getElementById(`module-${id}`);
            card.classList.toggle('open');
        }

        // ================== LOGICA DE PROGRESO Y XP ==================
        function toggleLesson(lessonId, xp) {
            const index = appState.completedLessons.indexOf(lessonId);
            if (index > -1) {
                appState.completedLessons.splice(index, 1);
                appState.xp = Math.max(0, appState.xp - xp);
            } else {
                appState.completedLessons.push(lessonId);
                appState.xp += xp;
                showToast(`¡Lección completada! +${xp} XP`);
            }
            saveState();
            renderRoadmap();
            updateGlobalMetrics();
        }

        function updateGlobalMetrics() {
            const totalLessons = 15;
            const completed = appState.completedLessons.length;
            const percent = Math.round((completed / totalLessons) * 100);

            document.getElementById('completedLessonsCount').innerText = completed;
            document.getElementById('totalProgressNum').innerText = `${percent}%`;
            document.getElementById('mainProgressBar').style.width = `${percent}%`;
            document.getElementById('xpPoints').innerText = `${appState.xp} XP`;
            
            // Minutos estudiados
            const minutes = Math.floor(appState.secondsStudied / 60);
            document.getElementById('totalStudyTime').innerText = `${minutes} min`;

            // Calcular Nivel del usuario
            const level = Math.floor(appState.xp / 150) + 1;
            document.getElementById('userLevel').innerText = level;
        }

        function saveState() {
            localStorage.setItem('db_completed_lessons', JSON.stringify(appState.completedLessons));
            localStorage.setItem('db_xp', appState.xp);
            localStorage.setItem('db_study_seconds', appState.secondsStudied);
        }

        function resetProgressPrompt() {
            if (confirm("¿Estás seguro de que deseas reiniciar todo tu progreso y XP?")) {
                appState.completedLessons = [];
                appState.xp = 0;
                appState.secondsStudied = 0;
                appState.fatigueLevel = 10;
                saveState();
                renderRoadmap();
                updateGlobalMetrics();
                showToast("Progreso reiniciado correctamente");
            }
        }

        // ================== CONTROL DE FATIGA & TIMER ==================
        let timerInterval = null;
        let pomodoroSeconds = 25 * 60;
        let isTimerRunning = false;

        function toggleTimer() {
            const btn = document.getElementById('pomodoroBtn');
            if (isTimerRunning) {
                clearInterval(timerInterval);
                btn.innerText = "Reanudar Sesión";
                btn.style.background = "var(--primary)";
                isTimerRunning = false;
            } else {
                isTimerRunning = true;
                btn.innerText = "Pausar Sesión";
                btn.style.background = "var(--warning)";
                timerInterval = setInterval(() => {
                    if (pomodoroSeconds > 0) {
                        pomodoroSeconds--;
                        appState.secondsStudied++;
                        increaseFatigue(0.08); // La fatiga aumenta gradualmente
                        updateTimerDisplay();
                    } else {
                        clearInterval(timerInterval);
                        isTimerRunning = false;
                        triggerFatigueAlert();
                        pomodoroSeconds = 25 * 60;
                        btn.innerText = "Iniciar Sesión";
                        btn.style.background = "var(--primary)";
                    }
                }, 1000);
            }
        }

        function updateTimerDisplay() {
            const m = Math.floor(pomodoroSeconds / 60).toString().padStart(2, '0');
            const s = (pomodoroSeconds % 60).toString().padStart(2, '0');
            document.getElementById('pomodoroDisplay').innerText = `${m}:${s}`;
            updateGlobalMetrics();
        }

        function increaseFatigue(amount) {
            appState.fatigueLevel = Math.min(100, appState.fatigueLevel + amount);
            updateFatigueUI();

            if (appState.fatigueLevel >= 85) {
                triggerFatigueAlert();
            }
        }

        function updateFatigueUI() {
            const bar = document.getElementById('fatigueBar');
            const text = document.getElementById('fatiguePercentText');
            const statusText = document.getElementById('fatigueStatusText');

            const val = Math.round(appState.fatigueLevel);
            bar.style.width = `${val}%`;
            text.innerText = `${val}%`;

            if (val < 40) {
                bar.style.backgroundColor = "var(--success)";
                text.style.color = "var(--success)";
                if (statusText) { statusText.innerText = "Bajo (Óptimo)"; statusText.style.color = "var(--success)"; }
            } else if (val < 75) {
                bar.style.backgroundColor = "var(--warning)";
                text.style.color = "var(--warning)";
                if (statusText) { statusText.innerText = "Moderado"; statusText.style.color = "var(--warning)"; }
            } else {
                bar.style.backgroundColor = "var(--danger)";
                text.style.color = "var(--danger)";
                if (statusText) { statusText.innerText = "Crítico (Descanso sugerido)"; statusText.style.color = "var(--danger)"; }
            }
        }

        function triggerFatigueAlert() {
            document.getElementById('fatigueModal').style.display = 'flex';
        }

        function dismissModal() {
            document.getElementById('fatigueModal').style.display = 'none';
        }

        function takeBreakAction() {
            resetFatigue();
            dismissModal();
            pomodoroSeconds = 5 * 60; // 5 min de descanso
            updateTimerDisplay();
            showToast("Modo Descanso activado (5 min). ¡Estira el cuerpo!");
        }

        function resetFatigue() {
            appState.fatigueLevel = 10;
            updateFatigueUI();
            showToast("Nivel de fatiga restablecido.");
        }

        function triggerMiniBreak(type) {
            appState.fatigueLevel = Math.max(10, appState.fatigueLevel - 15);
            updateFatigueUI();
            showToast(`¡Pausa de ${type} registrada! Fatiga reducida.`);
        }

        function startContinuousFatigueEngine() {
            setInterval(() => {
                updateFatigueUI();
            }, 3000);
        }

        // ================== SISTEMA DE EVALUACIÓN ==================
        function initQuiz() {
            const q = quizBank[appState.currentQuizIndex];
            document.getElementById('quizModuleBadge').innerText = q.module;
            document.getElementById('quizQuestion').innerText = `${appState.currentQuizIndex + 1}. ${q.question}`;
            
            const optionsContainer = document.getElementById('quizOptions');
            optionsContainer.innerHTML = '';
            document.getElementById('quizFeedback').innerText = '';
            document.getElementById('nextQuestionBtn').style.display = 'none';

            q.options.forEach((opt, idx) => {
                const btn = document.createElement('div');
                btn.className = 'quiz-option';
                btn.innerHTML = `<span style="width:24px; height:24px; border-radius:50%; background: rgba(255,255,255,0.08); display:inline-flex; align-items:center; justify-content:center; font-size:0.8rem;">${String.fromCharCode(65 + idx)}</span> <span>${opt}</span>`;
                btn.onclick = () => selectQuizOption(idx, btn);
                optionsContainer.appendChild(btn);
            });
        }

        function selectQuizOption(selectedIdx, element) {
            const q = quizBank[appState.currentQuizIndex];
            const allOptions = document.querySelectorAll('.quiz-option');
            allOptions.forEach(op => op.style.pointerEvents = 'none'); // Bloquear clicks

            const feedback = document.getElementById('quizFeedback');
            if (selectedIdx === q.correct) {
                element.classList.add('correct');
                feedback.innerHTML = '<span style="color: var(--success);"><i class="fa-solid fa-circle-check"></i> ¡Excelente! Respuesta correcta (+50 XP).</span>';
                appState.xp += 50;
                saveState();
                updateGlobalMetrics();
            } else {
                element.classList.add('incorrect');
                allOptions[q.correct].classList.add('correct');
                feedback.innerHTML = '<span style="color: var(--danger);"><i class="fa-solid fa-circle-xmark"></i> Incorrecto. Revisa el material del módulo.</span>';
            }
            document.getElementById('nextQuestionBtn').style.display = 'inline-flex';
        }

        function nextQuizQuestion() {
            appState.currentQuizIndex = (appState.currentQuizIndex + 1) % quizBank.length;
            initQuiz();
        }

        // ================== PLAYGROUND SQL SIMULADO ==================
        function executeSqlSimulator() {
            const query = document.getElementById('sqlInput').value.trim();
            const output = document.getElementById('sqlOutput');

            output.innerHTML = `<span style="color: var(--warning);"><i class="fa-solid fa-spinner fa-spin"></i> Ejecutando consulta en el motor virtual...</span>`;

            setTimeout(() => {
                if (/SELECT/i.test(query)) {
                    output.innerHTML = `
<span style="color: var(--success);">STATUS: 200 OK • 3 Filas devueltas en 4.2ms</span>
----------------------------------------------------------------------
| id  | nombre          | email                  | salario ($)       |
----------------------------------------------------------------------
| 104 | Carlos Méndez   | carlos.m@empresa.com   | 4,500.00          |
| 108 | Elena Rostova   | elena.r@empresa.com    | 4,200.00          |
| 112 | Marcus Vance    | m.vance@empresa.com    | 3,800.00          |
----------------------------------------------------------------------
Query plan: Index Scan using idx_salario on empleados (cost=0.15..8.20)`;
                } else if (/CREATE|INSERT|UPDATE|DELETE/i.test(query)) {
                    output.innerHTML = `<span style="color: var(--success);">STATUS: OK • Operación DDL/DML ejecutada con éxito. 1 fila o esquema afectado.</span>`;
                } else {
                    output.innerHTML = `<span style="color: var(--danger);">ERROR DE SINTAXIS: Comando no reconocido cerca de "${query.substring(0, 15)}..."</span>`;
                }
            }, 400);
        }

        function loadSqlPreset(type) {
            const input = document.getElementById('sqlInput');
            if (type === 'join') {
                input.value = "SELECT c.nombre AS cliente, COUNT(p.id) AS total_pedidos, SUM(p.monto) AS gasto_total\nFROM clientes c\nLEFT JOIN pedidos p ON c.id = p.cliente_id\nGROUP BY c.id, c.nombre\nORDER BY gasto_total DESC;";
            } else if (type === 'group') {
                input.value = "SELECT departamento_id, AVG(salario) AS salario_medio\nFROM empleados\nGROUP BY departamento_id\nHAVING AVG(salario) > 3500;";
            }
        }

        // ================== NAVEGACIÓN ENTRE VISTAS ==================
        function switchView(viewName, element) {
            document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            
            document.getElementById(`view-${viewName}`).classList.add('active');
            element.classList.add('active');
        }

        // ================== HELPERS ==================
        function escapeHtml(str) {
            return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }

        function showToast(msg) {
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed; bottom: 24px; right: 24px; background: #1E293B; border-left: 4px solid var(--accent);
                color: #fff; padding: 12px 20px; border-radius: 8px; font-size: 0.9rem; z-index: 10000;
                box-shadow: 0 10px 25px rgba(0,0,0,0.5); animation: fadeIn 0.3s ease;
            `;
            toast.innerHTML = `<i class="fa-solid fa-bell" style="color: var(--accent); margin-right: 8px;"></i> ${msg}`;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            }, 3500);
        }