/* BASE DE DATOS DEL CURRÍCULO */
        const curriculum = [
            {
                id: 0,
                level: 'Básico',
                levelClass: 'badge-basic',
                badgeIndex: 0,
                title: '1. Modelo Relacional y Fundamentos SQL',
                tags: ['Tablas', 'Primary Key', 'Foreign Key', 'SELECT', 'WHERE'],
                theory: `El modelo relacional organiza datos en tablas (relaciones) compuestas por filas (tuplas) y columnas (atributos). Las **Primary Keys (PK)** identifican unívocamente cada fila, mientras que las **Foreign Keys (FK)** establecen relaciones de integridad referencial. El lenguaje estándar para interactuar con estos datos es SQL (Structured Query Language).`,
                code: `-- Creación y consulta básica\nCREATE TABLE usuarios (\n    id_usuario INT PRIMARY KEY,\n    nombre VARCHAR(100) NOT NULL,\n    email VARCHAR(100) UNIQUE\n);\n\nSELECT nombre, email FROM usuarios WHERE id_usuario = 1;`,
                challengePrompt: "Escribe una consulta para seleccionar todos los campos de la tabla 'usuarios' donde el 'email' contenga '@gmail.com'.",
                expectedKeywords: ['SELECT', '*', 'FROM', 'usuarios', 'WHERE'],
                quiz: {
                    question: "¿Qué garantiza una clave foránea (Foreign Key) en una tabla relacional?",
                    options: [
                        "Que los valores numéricos no sean negativos.",
                        "La integridad referencial vinculando una fila con la clave primaria de otra tabla.",
                        "La velocidad máxima de cifrado de transacciones.",
                        "Que la tabla no admita duplicados en ninguna columna."
                    ],
                    correctIndex: 1
                },
                tasks: ["Comprender la anatomía de una tabla", "Escribir primera consulta SELECT", "Completar test de claves relacionales"]
            },
            {
                id: 1,
                level: 'Básico - Intermedio',
                levelClass: 'badge-basic',
                badgeIndex: 0,
                title: '2. Consultas Multitabla: JOINs y Agregaciones',
                tags: ['INNER JOIN', 'LEFT JOIN', 'GROUP BY', 'HAVING', 'COUNT'],
                theory: `Las bases de datos relacionales destacan cuando combinamos conjuntos de datos. Un **INNER JOIN** retorna coincidencias exactas, un **LEFT JOIN** conserva todos los registros de la izquierda. **GROUP BY** junto con funciones de agregación (SUM, AVG, COUNT) permite condensar millones de registros en métricas de negocio.`,
                code: `-- Agrupación y uniones\nSELECT c.nombre, COUNT(p.id_pedido) AS total_pedidos\nFROM clientes c\nLEFT JOIN pedidos p ON c.id_cliente = p.id_cliente\nGROUP BY c.id_cliente\nHAVING COUNT(p.id_pedido) > 5;`,
                challengePrompt: "Escribe una consulta con INNER JOIN entre 'ordenes' y 'clientes' usando 'id_cliente'.",
                expectedKeywords: ['SELECT', 'FROM', 'ordenes', 'INNER JOIN', 'clientes', 'ON'],
                quiz: {
                    question: "¿Cuál es la diferencia entre WHERE y HAVING?",
                    options: [
                        "HAVING filtra filas antes de agrupar; WHERE filtra grupos agregados.",
                        "WHERE filtra filas individuales antes del agrupamiento; HAVING filtra los resultados agregados producidos por GROUP BY.",
                        "No existe diferencia, son sinónimos en el estándar ANSI SQL.",
                        "WHERE solo funciona con claves primarias."
                    ],
                    correctIndex: 1
                },
                tasks: ["Dominar diagramas de Venn de JOINs", "Usar GROUP BY con filtros HAVING", "Resolver consulta de clientes y pedidos"]
            },
            {
                id: 2,
                level: 'Intermedio',
                levelClass: 'badge-inter',
                badgeIndex: 1,
                title: '3. Normalización y Diseño de Esquemas (1FN a 3FN/Boyce-Codd)',
                tags: ['1FN', '2FN', '3FN', 'Anomalías de Datos', 'Redundancia'],
                theory: `La normalización es el proceso sistemático de descomponer tablas para eliminar anomalías de inserción, actualización y borrado. 
                - **1FN**: Valores atómicos y sin grupos repetitivos.
                - **2FN**: Cumple 1FN y no tiene dependencias funcionales parciales.
                - **3FN**: Cumple 2FN y no tiene dependencias transitivas (columnas que dependan de otras que no sean clave).`,
                code: `-- Esquema Normalizado (3FN)\nCREATE TABLE ciudades (\n    id_ciudad INT PRIMARY KEY,\n    nombre VARCHAR(100)\n);\n\nCREATE TABLE sucursales (\n    id_sucursal INT PRIMARY KEY,\n    id_ciudad INT REFERENCES ciudades(id_ciudad)\n);`,
                challengePrompt: "Diseña un SELECT que obtenga 'sucursales' con su nombre de 'ciudades' asegurando que no haya redundancia.",
                expectedKeywords: ['SELECT', 'FROM', 'sucursales', 'JOIN', 'ciudades'],
                quiz: {
                    question: "Si una columna depende de otra que NO es clave primaria, ¿qué forma normal se está violando?",
                    options: [
                        "Tercera Forma Normal (3FN - Dependencia Transitiva)",
                        "Primera Forma Normal (1FN)",
                        "Segunda Forma Normal (2FN)",
                        "No viola ninguna forma normal si es numérica"
                    ],
                    correctIndex: 0
                },
                tasks: ["Identificar anomalías de actualización", "Descomponer tabla a 3FN", "Aprobar evaluación de dependencias"]
            },
            {
                id: 3,
                level: 'Intermedio - Avanzado',
                levelClass: 'badge-inter',
                badgeIndex: 2,
                title: '4. Optimización, Índices (B-Tree, Hash) y Planes de Ejecución',
                tags: ['B-Tree', 'EXPLAIN ANALYZE', 'Índices Compuestos', 'Scan vs Seek'],
                theory: `Un índice es una estructura de datos (frecuentemente árboles B-Tree) que acelera la recuperación de registros a costa de sobrecarga en escrituras (INSERT/UPDATE). Usar **EXPLAIN** permite inspeccionar el costo de la consulta: evitar a toda costa los Sequential Scans (Seq Scan) en tablas millonarias cuando un Index Scan es posible.`,
                code: `-- Creación de índices y análisis de rendimiento\nCREATE INDEX idx_usuarios_email ON usuarios(email);\n\nEXPLAIN ANALYZE \nSELECT * FROM usuarios WHERE email = 'dev@master.com';`,
                challengePrompt: "Crea un comando para crear un índice llamado 'idx_orden_fecha' en la tabla 'pedidos' sobre 'fecha_creacion'.",
                expectedKeywords: ['CREATE', 'INDEX', 'idx_orden_fecha', 'ON', 'pedidos'],
                quiz: {
                    question: "¿Qué desventaja principal tiene añadir demasiados índices en una base de datos con alto tráfico?",
                    options: [
                        "Las consultas SELECT se vuelven infinitamente lentas.",
                        "Degrada el rendimiento de las operaciones de escritura (INSERT, UPDATE, DELETE) debido al mantenimiento continuo de los índices.",
                        "Deshabilita automáticamente las transacciones ACID.",
                        "Elimina los registros duplicados sin confirmación previa."
                    ],
                    correctIndex: 1
                },
                tasks: ["Leer un plan EXPLAIN ANALYZE", "Construir índice compuesto", "Analizar costo de costo I/O"]
            },
            {
                id: 4,
                level: 'Avanzado',
                levelClass: 'badge-adv',
                badgeIndex: 2,
                title: '5. Transacciones ACID, Niveles de Aislamiento y Concurrencia',
                tags: ['ACID', 'Deadlocks', 'MVCC', 'Read Committed', 'Serializable'],
                theory: `ACID asegura confiabilidad: **Atomicidad** (todo o nada), **Consistencia** (reglas válidas), **Aislamiento** (transacciones independientes) y **Durabilidad** (persistencia tras crash). Los motores modernos utilizan MVCC (Multi-Version Concurrency Control) para permitir que los lectores no bloqueen a los escritores y viceversa.`,
                code: `-- Transacción segura con Rollback\nBEGIN TRANSACTION;\n  UPDATE cuentas SET saldo = saldo - 500 WHERE id = 101;\n  UPDATE cuentas SET saldo = saldo + 500 WHERE id = 202;\nCOMMIT; -- o ROLLBACK ante error`,
                challengePrompt: "Escribe una estructura de transacción usando BEGIN y COMMIT.",
                expectedKeywords: ['BEGIN', 'TRANSACTION', 'UPDATE', 'COMMIT'],
                quiz: {
                    question: "¿Qué anomalía de concurrencia previene el nivel de aislamiento 'Serializable'?",
                    options: [
                        "Dirty Reads (Lecturas Sucias) únicamente.",
                        "Phantom Reads (Lecturas Fantasma) y cualquier inconsistencia de serialización.",
                        "Consumo de memoria RAM.",
                        "Fugas de red en clientes HTTP."
                    ],
                    correctIndex: 1
                },
                tasks: ["Simular bloqueo de concurrencia", "Revisar niveles de Isolation", "Implementar patrón Commit/Rollback"]
            },
            {
                id: 5,
                level: 'Avanzado - Cloud',
                levelClass: 'badge-adv',
                badgeIndex: 3,
                title: '6. NoSQL, Replicación, Particionamiento y Teorema CAP',
                tags: ['NoSQL', 'Document/Key-Value', 'Sharding', 'CAP Theorem', 'Replication'],
                theory: `Cuando los datos sobrepasan un solo servidor, pasamos a escalabilidad horizontal. El **Teorema CAP** establece que un sistema distribuido solo puede garantizar simultáneamente dos de tres propiedades: Consistencia (C), Disponibilidad (A) y Tolerancia a Particiones (P). Los almacenes NoSQL (Documentales, Clave-Valor, Grafos) sacrifican ACID estricto por rendimiento masivo y flexibilidad.`,
                code: `-- Ejemplo modelo documental (JSON en PostgreSQL o MongoDB)\nSELECT info->>'cliente' AS cliente\nFROM ordenes_json\nWHERE info->'metadata'->>'estado' = 'completado';`,
                challengePrompt: "Formula una consulta que acceda a un campo JSON usando el operador ->>.",
                expectedKeywords: ['SELECT', 'FROM', '->>'],
                quiz: {
                    question: "Según el teorema CAP, ante una partición de red (P), ¿qué compromiso debe tomar el sistema distribuido?",
                    options: [
                        "Elegir entre Consistencia estricta (C) o Disponibilidad inmediata (A).",
                        "Eliminar todos los nodos replicados.",
                        "Cambiar automáticamente el motor a SQL relacional.",
                        "Garantizar el 100% de consistencia y disponibilidad sin latencia."
                    ],
                    correctIndex: 0
                },
                tasks: ["Comprender tradeoff del Teorema CAP", "Diseñar partición por Shard Key", "Completar laboratorio final"]
            }
        ];

        /* ESTADO DE LA APLICACIÓN */
        let state = {
            currentModuleIndex: 0,
            completedModules: new Set(),
            userXP: 0,
            completedTasks: new Set(),
            unlockedBadges: new Set()
        };

        /* CONTROL DE FATIGA (POMODORO & ERGONOMÍA) */
        let timerSeconds = 25 * 60;
        let initialTimerDuration = 25 * 60;
        let isTimerRunning = false;
        let timerInterval = null;
        let continuousFocusMinutes = 0;

        // Web Audio API para alertas sonoras suaves (sin archivos externos)
        function playChime(freq = 587.33, duration = 0.4) {
            try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + duration);
            } catch (e) {
                console.log("Audio not allowed yet");
            }
        }

        function toggleTimer() {
            if (isTimerRunning) {
                clearInterval(timerInterval);
                isTimerRunning = false;
                document.getElementById('startTimerBtn').textContent = 'Continuar';
            } else {
                isTimerRunning = true;
                document.getElementById('startTimerBtn').textContent = 'Pausar';
                timerInterval = setInterval(() => {
                    if (timerSeconds > 0) {
                        timerSeconds--;
                        updateTimerDisplay();
                        if (timerSeconds % 60 === 0) {
                            continuousFocusMinutes++;
                            evaluateFatigueState();
                        }
                    } else {
                        clearInterval(timerInterval);
                        isTimerRunning = false;
                        playChime(880, 0.8);
                        alert("🎉 ¡Ciclo completado! Tómate 5 minutos de descanso activo.");
                        resetTimer();
                    }
                }, 1000);
            }
        }

        function resetTimer() {
            clearInterval(timerInterval);
            isTimerRunning = false;
            timerSeconds = 25 * 60;
            updateTimerDisplay();
            document.getElementById('startTimerBtn').textContent = 'Iniciar';
        }

        function updateTimerDisplay() {
            const mins = Math.floor(timerSeconds / 60);
            const secs = timerSeconds % 60;
            document.getElementById('timerValue').textContent = 
                `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        function evaluateFatigueState() {
            const dot = document.getElementById('fatigueDot');
            const txt = document.getElementById('fatigueText');
            const alertBox = document.getElementById('restAlertBox');

            if (continuousFocusMinutes >= 45) {
                dot.style.backgroundColor = 'var(--accent-rose)';
                dot.style.boxShadow = '0 0 8px var(--accent-rose)';
                txt.textContent = 'Fatiga Alta';
                alertBox.classList.add('show');
                playChime(440, 0.5);
            } else if (continuousFocusMinutes >= 25) {
                dot.style.backgroundColor = 'var(--accent-amber)';
                dot.style.boxShadow = '0 0 8px var(--accent-amber)';
                txt.textContent = 'Precaución';
            } else {
                dot.style.backgroundColor = 'var(--accent-green)';
                dot.style.boxShadow = '0 0 8px var(--accent-green)';
                txt.textContent = 'Óptimo';
            }
        }

        function dismissAlert() {
            document.getElementById('restAlertBox').classList.remove('show');
            continuousFocusMinutes = 0;
            evaluateFatigueState();
        }

        /* RENDERIZADO DEL PLAN DE ESTUDIO */
        function initApp() {
            renderModuleNav();
            loadModule(0);
            updateGlobalStats();
        }

        function renderModuleNav() {
            const list = document.getElementById('moduleNavList');
            list.innerHTML = '';
            curriculum.forEach((mod, idx) => {
                const isCompleted = state.completedModules.has(idx);
                const li = document.createElement('li');
                li.className = `module-item ${idx === state.currentModuleIndex ? 'active' : ''}`;
                li.onclick = () => loadModule(idx);
                li.innerHTML = `
                    <span class="module-badge ${mod.levelClass}">${mod.level}</span>
                    <div class="module-name">
                        <span>${mod.title.split('. ')[1] || mod.title}</span>
                        ${isCompleted ? '<span style="color:var(--accent-green);">✓</span>' : ''}
                    </div>
                    <div class="module-progress-mini">
                        <div class="module-progress-fill" style="width: ${isCompleted ? 100 : 0}%;"></div>
                    </div>
                `;
                list.appendChild(li);
            });
        }

        function loadModule(index) {
            state.currentModuleIndex = index;
            const data = curriculum[index];

            document.getElementById('lessonBadge').textContent = data.level.toUpperCase();
            document.getElementById('lessonBadge').className = `module-badge ${data.levelClass}`;
            document.getElementById('lessonTitle').textContent = data.title;
            document.getElementById('lessonTheory').innerHTML = data.theory;
            document.getElementById('lessonCodeSnippet').textContent = data.code;
            
            // Tags
            const tagContainer = document.getElementById('lessonTags');
            tagContainer.innerHTML = data.tags.map(t => `<span class="pill">#${t}</span>`).join('');

            // Reset Playground
            document.getElementById('sqlQueryInput').value = '';
            document.getElementById('queryConsole').classList.remove('active');

            // Render Quiz
            renderQuiz(data.quiz);

            // Render Tasks
            renderTasks(data.tasks, index);

            renderModuleNav();
        }

        function renderQuiz(quizData) {
            const container = document.getElementById('quizContainer');
            container.innerHTML = `
                <p style="font-size: 0.95rem; font-weight:600; margin-bottom: 12px; color: #f1f5f9;">
                    ${quizData.question}
                </p>
                <div id="quizOptionsList">
                    ${quizData.options.map((opt, i) => `
                        <div class="quiz-option" onclick="checkQuizAnswer(${i}, ${quizData.correctIndex})">
                            <span style="font-family: 'JetBrains Mono'; color: var(--text-muted); font-size:0.8rem;">[${String.fromCharCode(65 + i)}]</span>
                            <span>${opt}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        function checkQuizAnswer(selectedIndex, correctIndex) {
            const options = document.querySelectorAll('.quiz-option');
            if (selectedIndex === correctIndex) {
                options[selectedIndex].classList.add('correct');
                playChime(784, 0.3);
                
                if (!state.completedModules.has(state.currentModuleIndex)) {
                    state.completedModules.add(state.currentModuleIndex);
                    state.userXP += 100;
                    unlockBadge(curriculum[state.currentModuleIndex].badgeIndex);
                    updateGlobalStats();
                    renderModuleNav();
                }
            } else {
                options[selectedIndex].classList.add('incorrect');
                options[correctIndex].classList.add('correct');
                playChime(300, 0.4);
            }
        }

        function renderTasks(tasks, modIndex) {
            const list = document.getElementById('moduleTasksList');
            list.innerHTML = '';
            tasks.forEach((task, tIndex) => {
                const taskId = `${modIndex}-${tIndex}`;
                const isChecked = state.completedTasks.has(taskId);
                const li = document.createElement('li');
                li.className = `task-item ${isChecked ? 'completed' : ''}`;
                li.onclick = () => toggleTask(taskId);
                li.innerHTML = `
                    <div class="custom-checkbox"></div>
                    <span>${task}</span>
                `;
                list.appendChild(li);
            });
        }

        function toggleTask(taskId) {
            if (state.completedTasks.has(taskId)) {
                state.completedTasks.delete(taskId);
            } else {
                state.completedTasks.add(taskId);
                state.userXP += 25;
                playChime(659, 0.2);
            }
            updateGlobalStats();
            renderTasks(curriculum[state.currentModuleIndex].tasks, state.currentModuleIndex);
        }

        function executeLaboratoryQuery() {
            const input = document.getElementById('sqlQueryInput').value.trim();
            const consoleBox = document.getElementById('queryConsole');
            const activeMod = curriculum[state.currentModuleIndex];
            
            consoleBox.classList.add('active');

            if (!input) {
                consoleBox.innerHTML = `<span style="color: var(--accent-rose);">❌ Error: El editor de consultas está vacío.</span>`;
                return;
            }

            // Validación flexible de palabras clave requeridas
            const upper = input.toUpperCase();
            const hasAllKeywords = activeMod.expectedKeywords.every(kw => upper.includes(kw));

            if (hasAllKeywords) {
                consoleBox.innerHTML = `
                    <div style="color: var(--accent-green); margin-bottom: 6px;">✓ QUERY EXECUTED SUCCESSFULLY (0.024 ms)</div>
                    <div style="color: var(--text-muted);">Filas afectadas: 4 | Bloques leídos: 1 | Cache Hit: 100%</div>
                    <div style="margin-top: 8px; color: #38bdf8;">+ RESULT SET: OK [Transacción simulada verificada]</div>
                `;
                playChime(600, 0.3);
                state.userXP += 30;
                updateGlobalStats();
            } else {
                consoleBox.innerHTML = `
                    <div style="color: var(--accent-amber);">⚠️ Consulta ejecutada pero no cumple todos los criterios esperados.</div>
                    <div style="color: var(--text-muted); font-size: 0.75rem; margin-top: 4px;">Pistas esperadas: ${activeMod.expectedKeywords.join(', ')}</div>
                `;
            }
        }

        function resetEditor() {
            document.getElementById('sqlQueryInput').value = '';
            document.getElementById('queryConsole').classList.remove('active');
        }

        function navigateModule(delta) {
            const nextIdx = state.currentModuleIndex + delta;
            if (nextIdx >= 0 && nextIdx < curriculum.length) {
                loadModule(nextIdx);
            }
        }

        function unlockBadge(badgeIndex) {
            state.unlockedBadges.add(badgeIndex);
            const badgeElem = document.getElementById(`badge-${badgeIndex}`);
            if (badgeElem) {
                badgeElem.classList.add('unlocked');
            }
            document.getElementById('badgeScore').textContent = `${state.unlockedBadges.size}/4`;
        }

        function updateGlobalStats() {
            const totalModules = curriculum.length;
            const completed = state.completedModules.size;
            const progress = Math.round((completed / totalModules) * 100);

            document.getElementById('globalProgressTxt').textContent = `${progress}%`;
            document.getElementById('globalProgressBar').style.width = `${progress}%`;
            document.getElementById('userXP').textContent = `${state.userXP} XP`;
            document.getElementById('completedModulesCount').textContent = `${completed} / ${totalModules}`;
        }

        // Inicialización
        window.addEventListener('DOMContentLoaded', initApp);