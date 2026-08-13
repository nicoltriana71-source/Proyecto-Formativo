/* ==========================================================
           CURRICULUM DATA: AI + DATABASES (BASIC TO ADVANCED)
        ========================================================== */
        const curriculum = [
            {
                id: "mod-1",
                level: "Básico",
                badgeClass: "badge-basic",
                title: "1. Fundamentos & Text-to-SQL",
                lessons: [
                    {
                        id: "l-101",
                        title: "Arquitectura Text-to-SQL Básica",
                        category: "Módulo 1 • Básico",
                        content: `
                            <p>Para conectar un Modelo de Lenguaje (LLM) con una base de datos relacional (como PostgreSQL, MySQL o SQLite), el enfoque fundamental es <strong>Text-to-SQL</strong>: el modelo traduce el lenguaje natural a una consulta SQL ejecutable.</p>
                            
                            <div class="architecture-diagram">
                                <div class="diagram-node">1. Usuario ("Ventas de Mayo")</div>
                                <div class="diagram-arrow">➔</div>
                                <div class="diagram-node highlight">2. LLM + Schema Prompt</div>
                                <div class="diagram-arrow">➔</div>
                                <div class="diagram-node">3. Base de Datos SQL</div>
                                <div class="diagram-arrow">➔</div>
                                <div class="diagram-node highlight">4. Respuesta Sintetizada</div>
                            </div>

                            <h3>Componentes Esenciales</h3>
                            <ul>
                                <li><strong>Inyección del Esquema (Schema DDL):</strong> Enviar las definiciones <code>CREATE TABLE</code> o tablas reducidas en el system prompt.</li>
                                <li><strong>Validación de Solo Lectura:</strong> Nunca otorgar permisos de <code>DROP</code> o <code>DELETE</code> a la conexión utilizada por el LLM.</li>
                            </ul>

                            <h3>Ejemplo de Implementación en Python</h3>
                            <pre><code><span class="code-keyword">import</span> openai

schema = <span class="code-str">"CREATE TABLE ventas (id INT, monto FLOAT, fecha DATE);"</span>
pregunta = <span class="code-str">"¿Cuál fue el total de ventas del mes pasado?"</span>

prompt = <span class="code-str">f"""Dada la siguiente base de datos:
{schema}
Genera únicamente la consulta SQL válida para responder: {pregunta}"""</span>

response = openai.ChatCompletion.create(
    model=<span class="code-str">"gpt-4"</span>,
    messages=[{<span class="code-str">"role"</span>: <span class="code-str">"user"</span>, <span class="code-str">"content"</span>: prompt}]
)
sql_query = response.choices[0].message.content</code></pre>
                        `,
                        activity: {
                            title: "Construcción de Prompt Seguro para Text-to-SQL",
                            desc: "Escribe la instrucción de sistema (System Prompt) obligatoria para forzar a la IA a generar únicamente sentencias 'SELECT' y prevenir modificaciones a la base de datos.",
                            placeholder: "-- Escribe aquí la directiva de seguridad del prompt...",
                            solutionKeywords: ["SELECT", "DELETE", "DROP", "SOLO"],
                            hint: "Incluye reglas como: 'Solo genera sentencias SELECT. Prohibido DROP, ALTER o DELETE'."
                        },
                        quiz: [
                            {
                                question: "¿Cuál es el principal riesgo de seguridad al usar Text-to-SQL directo sin capas intermedias?",
                                options: [
                                    "La base de datos se vuelve más lenta en memoria RAM.",
                                    "Inyección SQL destructiva si el modelo genera comandos como DROP o DELETE.",
                                    "Los LLMs no entienden sintaxis relacional.",
                                    "No se pueden usar índices B-Tree."
                                ],
                                correct: 1,
                                explanation: "Si el usuario engaña al modelo (jailbreak) o este alucina, puede ejecutar sentencias destructivas si la conexión tiene privilegios de escritura."
                            }
                        ]
                    },
                    {
                        id: "l-102",
                        title: "Sanitización y Validación AST",
                        category: "Módulo 1 • Básico",
                        content: `
                            <p>No basta con pedirle al LLM que sea seguro. Antes de ejecutar cualquier SQL generado, debemos validar el <strong>Árbol de Sintaxis Abstracta (AST)</strong> usando librerías como <code>sqlglot</code>.</p>
                            <h3>Pipeline de Validación</h3>
                            <p>1. Recibir SQL generado por la IA.<br>2. Parsear el SQL en un árbol sintáctico.<br>3. Verificar que solo contenga nodos <code>Select</code>.<br>4. Ejecutar con un usuario de base de datos con permisos estrictos de <code>READ ONLY</code>.</p>
                        `,
                        activity: {
                            title: "Filtro de Seguridad de Comandos SQL",
                            desc: "Simula una función de validación que retorne 'VALID' si la consulta inicia con 'SELECT' y no contiene ';' ni 'DROP'.",
                            placeholder: "function validar(sql) { ... }",
                            solutionKeywords: ["SELECT", "DROP"],
                            hint: "Verifica que el comando inicie con SELECT y no contenga palabras clave peligrosas."
                        },
                        quiz: [
                            {
                                question: "¿Qué herramienta/técnica permite verificar de forma determinista la estructura de una consulta SQL antes de ejecutarla?",
                                options: [
                                    "Otro LLM que revise la consulta.",
                                    "Parser AST (Abstract Syntax Tree) determinista.",
                                    "Aumentar la temperatura a 1.0.",
                                    "Desactivar las claves foráneas."
                                ],
                                correct: 1,
                                explanation: "Los analizadores AST descomponen la consulta de manera determinista y matemática, garantizando que no existan sentencias no deseadas."
                            }
                        ]
                    }
                ]
            },
            {
                id: "mod-2",
                level: "Intermedio",
                badgeClass: "badge-intermediate",
                title: "2. Bases de Datos Vectoriales & RAG",
                lessons: [
                    {
                        id: "l-201",
                        title: "Embeddings y pgvector / ChromaDB",
                        category: "Módulo 2 • Intermedio",
                        content: `
                            <p>Cuando la información no está estructurada en filas y columnas (por ejemplo: manuales, PDFs, logs), usamos <strong>Embeddings Vectoriales</strong> y bases de datos vectoriales como <strong>pgvector (PostgreSQL)</strong>, <strong>ChromaDB</strong> o <strong>Pinecone</strong>.</p>
                            
                            <div class="architecture-diagram">
                                <div class="diagram-node">Documento / Texto</div>
                                <div class="diagram-arrow">➔</div>
                                <div class="diagram-node highlight">Embedding Model (OpenAI / HuggingFace)</div>
                                <div class="diagram-arrow">➔</div>
                                <div class="diagram-node">[0.024, -0.912, ...] Vector en DB</div>
                            </div>

                            <h3>Búsqueda por Similitud de Coseno en SQL (pgvector)</h3>
                            <pre><code><span class="code-comment">-- Consulta en PostgreSQL con pgvector</span>
<span class="code-keyword">SELECT</span> id, contenido, 
       <span class="code-func">1 - (embedding <=> '[0.012, -0.231, 0.881, ...]')</span> <span class="code-keyword">AS</span> similitud
<span class="code-keyword">FROM</span> base_conocimiento
<span class="code-keyword">ORDER BY</span> embedding <=> <span class="code-str">'[0.012, -0.231, 0.881, ...]'</span>
<span class="code-keyword">LIMIT</span> 3;</code></pre>
                        `,
                        activity: {
                            title: "Simulación de Query Vectorial con pgvector",
                            desc: "Escribe el operador de distancia de pgvector utilizado para calcular la distancia coseno entre vectores (<=>).",
                            placeholder: "SELECT * FROM items ORDER BY vector_col <=> ...",
                            solutionKeywords: ["<=>", "ORDER BY"],
                            hint: "Usa el operador <=> junto con ORDER BY y LIMIT."
                        },
                        quiz: [
                            {
                                question: "¿Qué representa un 'Vector Embedding' en una base de datos?",
                                options: [
                                    "Una clave primaria autoincremental.",
                                    "Una representación matemática numérica del significado semántico del texto.",
                                    "Un índice B-Tree comprimido.",
                                    "Un archivo binario JSON."
                                ],
                                correct: 1,
                                explanation: "Los embeddings transforman texto en arrays numéricos de alta dimensión donde conceptos semánticamente parecidos quedan cerca en el espacio vectorial."
                            }
                        ]
                    },
                    {
                        id: "l-202",
                        title: "Arquitectura RAG (Retrieval-Augmented Generation)",
                        category: "Módulo 2 • Intermedio",
                        content: `
                            <p>RAG combina lo mejor de dos mundos: recupera registros relevantes de tu base de datos y los inyecta en la ventana de contexto del LLM para evitar alucinaciones.</p>
                            <h3>Pasos del Ciclo RAG:</h3>
                            <ol>
                                <li><strong>Chunking:</strong> Fragmentar datos en bloques de 500-1000 tokens.</li>
                                <li><strong>Indexación:</strong> Almacenar vectores en la BD.</li>
                                <li><strong>Retrieval:</strong> Buscar los fragmentos más cercanos a la pregunta.</li>
                                <li><strong>Augmentation & Generation:</strong> Enviar contexto + pregunta al LLM.</li>
                            </ol>
                        `,
                        activity: {
                            title: "Estructura del Context Prompt RAG",
                            desc: "Escribe un prompt para LLM que incluya las etiquetas <contexto> y <pregunta>.",
                            placeholder: "Usa el siguiente contexto para responder: <contexto>...",
                            solutionKeywords: ["contexto", "pregunta"],
                            hint: "Define explícitamente que la IA solo debe responder en base al contexto suministrado."
                        },
                        quiz: [
                            {
                                question: "¿Por qué RAG es preferible al Fine-Tuning para consultar datos dinámicos empresariales?",
                                options: [
                                    "El Fine-Tuning es gratuito.",
                                    "RAG permite actualizar datos en tiempo real sin reentrenar el modelo y cita fuentes exactas.",
                                    "RAG no requiere ninguna base de datos.",
                                    "El Fine-Tuning elimina todas las alucinaciones por completo."
                                ],
                                correct: 1,
                                explanation: "RAG actualiza el conocimiento de inmediato al insertar registros en la base de datos sin incurrir en costosos entrenamientos."
                            }
                        ]
                    }
                ]
            },
            {
                id: "mod-3",
                level: "Avanzado",
                badgeClass: "badge-advanced",
                title: "3. Agentes Autónomos & GraphRAG",
                lessons: [
                    {
                        id: "l-301",
                        title: "Function Calling y Agentes Multi-Base de Datos",
                        category: "Módulo 3 • Avanzado",
                        content: `
                            <p>Los sistemas modernos utilizan <strong>Function / Tool Calling</strong> estructurado. El LLM decide dinámicamente si debe consultar una base SQL (para agregaciones numéricas) o una base Vectorial (para manuales no estructurados).</p>
                            
                            <h3>Definición de Herramientas (JSON Schema)</h3>
                            <pre><code>{
  <span class="code-str">"name"</span>: <span class="code-str">"query_sql_database"</span>,
  <span class="code-str">"description"</span>: <span class="code-str">"Ejecuta consultas agregadas (sumas, promedios) en PostgreSQL"</span>,
  <span class="code-str">"parameters"</span>: {
    <span class="code-str">"type"</span>: <span class="code-str">"object"</span>,
    <span class="code-str">"properties"</span>: {
      <span class="code-str">"query"</span>: { <span class="code-str">"type"</span>: <span class="code-str">"string"</span> }
    }
  }
}</code></pre>
                        `,
                        activity: {
                            title: "Declaración de Herramienta de Base de Datos",
                            desc: "Escribe la definición de un esquema JSON para una función llamada 'consultar_stock' que reciba el parámetro 'producto_id'.",
                            placeholder: '{"name": "consultar_stock", ...}',
                            solutionKeywords: ["consultar_stock", "producto_id"],
                            hint: "Crea el objeto JSON con las propiedades name y parameters."
                        },
                        quiz: [
                            {
                                question: "¿Cómo decide un agente de IA qué base de datos consultar cuando recibe una orden?",
                                options: [
                                    "Consulta todas las tablas aleatoriamente.",
                                    "Analiza la descripción semántica de sus 'Tools' (herramientas) y genera los argumentos en formato estructurado.",
                                    "Mediante triggers en PostgreSQL.",
                                    "Modificando su propio código fuente."
                                ],
                                correct: 1,
                                explanation: "El LLM evalúa la descripción de cada herramienta registrada y emite una llamada structured function call con los parámetros necesarios."
                            }
                        ]
                    },
                    {
                        id: "l-302",
                        title: "GraphRAG: Bases de Datos de Grafos (Neo4j)",
                        category: "Módulo 3 • Avanzado",
                        content: `
                            <p><strong>GraphRAG</strong> une bases de datos de grafos (como Neo4j con lenguaje Cypher) con modelos de lenguaje. Permite responder preguntas complejas de múltiples saltos de relación que los vectores no logran resolver con precisión.</p>
                            
                            <div class="architecture-diagram">
                                <div class="diagram-node">(Entidad: Cliente)</div>
                                <div class="diagram-arrow">─[COMPRÓ]─></div>
                                <div class="diagram-node highlight">(Entidad: Software)</div>
                                <div class="diagram-arrow">─[DEPENDE_DE]─></div>
                                <div class="diagram-node">(Entidad: Servidor)</div>
                            </div>
                        `,
                        activity: {
                            title: "Generación de Cypher Prompt para Neo4j",
                            desc: "Escribe un fragmento de consulta Cypher básica para buscar un nodo Usuario: MATCH (u:User) RETURN u.",
                            placeholder: "MATCH (u:User) ...",
                            solutionKeywords: ["MATCH", "RETURN"],
                            hint: "Usa la sintaxis MATCH (alias:Etiqueta) RETURN alias."
                        },
                        quiz: [
                            {
                                question: "¿Qué ventaja principal ofrece GraphRAG frente a la búsqueda puramente vectorial?",
                                options: [
                                    "Es más barato almacenar grafos que texto plano.",
                                    "Permite razonar sobre relaciones complejas y jerárquicas de múltiples saltos entre entidades.",
                                    "No necesita LLMs para responder.",
                                    "Reemplaza totalmente a SQL."
                                ],
                                correct: 1,
                                explanation: "GraphRAG estructura el conocimiento en nodos y aristas, permitiendo recorrer conexiones lógicas profundas y estructuradas sin perder contexto."
                            }
                        ]
                    }
                ]
            }
        ];

        /* ==========================================================
           APPLICATION STATE
        ========================================================== */
        let state = {
            currentLessonId: "l-101",
            completedLessons: new Set(),
            quizScores: 0,
            energyLevel: 100,
            activeSeconds: 0,
            quizSelectedOptions: {}
        };

        /* ==========================================================
           FATIGUE & TIMER SYSTEM
        ========================================================== */
        function initFatigueSystem() {
            // Timer ticker
            setInterval(() => {
                state.activeSeconds++;
                updateTimerDisplay();

                // Decay energy every 40 seconds of active time
                if (state.activeSeconds % 40 === 0 && state.energyLevel > 10) {
                    state.energyLevel -= 5;
                    updateEnergyDisplay();
                }

                // Trigger fatigue alert when energy drops below 30% or every 25 mins (Pomodoro)
                if (state.energyLevel <= 25 || state.activeSeconds === 1500) {
                    showFatigueModal();
                }
            }, 1000);

            // Breathing text animator in modal
            const breathingTexts = ["Inhala profundo... 🫁", "Sostén el aire... ⏳", "Exhala despacio... 🍃", "Relaja tus hombros... ✨"];
            let step = 0;
            setInterval(() => {
                const el = document.getElementById("breathingText");
                if (el) {
                    step = (step + 1) % breathingTexts.length;
                    el.innerText = breathingTexts[step];
                }
            }, 2500);
        }

        function updateTimerDisplay() {
            const mins = Math.floor(state.activeSeconds / 60);
            const secs = state.activeSeconds % 60;
            document.getElementById("sessionTimer").innerText = 
                `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        function updateEnergyDisplay() {
            const fill = document.getElementById("energyFill");
            const text = document.getElementById("energyText");
            text.innerText = `${state.energyLevel}%`;
            fill.style.width = `${state.energyLevel}%`;

            if (state.energyLevel > 60) {
                fill.style.background = "var(--success)";
            } else if (state.energyLevel > 30) {
                fill.style.background = "var(--warning)";
            } else {
                fill.style.background = "var(--danger)";
            }
        }

        function showFatigueModal() {
            document.getElementById("fatigueModal").classList.add("active");
        }

        function resumeFromBreak() {
            state.energyLevel = 100;
            updateEnergyDisplay();
            document.getElementById("fatigueModal").classList.remove("active");
        }

        document.getElementById("fatigueBtn").addEventListener("click", showFatigueModal);

        /* ==========================================================
           RENDER MODULES & NAVIGATION
        ========================================================== */
        function renderSidebar() {
            const container = document.getElementById("modulesList");
            container.innerHTML = "";

            curriculum.forEach((mod) => {
                const modDiv = document.createElement("div");
                modDiv.className = "module-item";

                let lessonsHtml = "";
                mod.lessons.forEach((l) => {
                    const isCompleted = state.completedLessons.has(l.id);
                    const isActive = l.id === state.currentLessonId;
                    lessonsHtml += `
                        <button class="lesson-btn ${isActive ? 'active' : ''}" onclick="selectLesson('${l.id}')">
                            <span>${l.title}</span>
                            <div class="status-dot ${isCompleted ? 'completed' : ''}"></div>
                        </button>
                    `;
                });

                modDiv.innerHTML = `
                    <div class="module-header">
                        <strong style="font-size: 0.95rem;">${mod.title}</strong>
                        <span class="module-badge ${mod.badgeClass}">${mod.level}</span>
                    </div>
                    <div class="lessons-sublist">
                        ${lessonsHtml}
                    </div>
                `;
                container.appendChild(modDiv);
            });

            updateProgressStats();
        }

        function getCurrentLessonData() {
            for (const mod of curriculum) {
                for (const l of mod.lessons) {
                    if (l.id === state.currentLessonId) return l;
                }
            }
            return curriculum[0].lessons[0];
        }

        function selectLesson(lessonId) {
            state.currentLessonId = lessonId;
            state.quizSelectedOptions = {};
            renderSidebar();
            loadLessonContent();
            // Reset activity output
            document.getElementById("consoleOutput").innerText = "Terminal lista. Esperando ejecución...";
            document.getElementById("consoleOutput").style.color = "var(--text-muted)";
            document.getElementById("activityInput").value = "";
        }

        function loadLessonContent() {
            const lesson = getCurrentLessonData();
            
            // Tab 1: Theory
            document.getElementById("lessonCategory").innerText = lesson.category;
            document.getElementById("lessonTitle").innerText = lesson.title;
            document.getElementById("lessonContent").innerHTML = lesson.content;

            // Tab 2: Activity
            document.getElementById("activityTitle").innerText = lesson.activity.title;
            document.getElementById("activityDesc").innerText = lesson.activity.desc;
            document.getElementById("activityInput").placeholder = lesson.activity.placeholder || "Escribe tu solución...";

            // Tab 3: Quiz
            renderQuiz(lesson.quiz);
        }

        /* ==========================================================
           QUIZ ENGINE
        ========================================================== */
        function renderQuiz(quizArray) {
            const container = document.getElementById("quizContainer");
            container.innerHTML = "";

            quizArray.forEach((q, qIndex) => {
                const quizCard = document.createElement("div");
                quizCard.className = "quiz-card";

                let optionsHtml = "";
                q.options.forEach((opt, optIndex) => {
                    optionsHtml += `
                        <div class="quiz-option" id="opt-${qIndex}-${optIndex}" onclick="selectQuizOption(${qIndex}, ${optIndex})">
                            <span style="font-weight: 700; color: var(--text-dim);">${String.fromCharCode(65 + optIndex)}.</span>
                            <span>${opt}</span>
                        </div>
                    `;
                });

                quizCard.innerHTML = `
                    <div class="quiz-question">${qIndex + 1}. ${q.question}</div>
                    <div class="options-list">
                        ${optionsHtml}
                    </div>
                    <div class="quiz-feedback" id="feedback-${qIndex}"></div>
                `;
                container.appendChild(quizCard);
            });
        }

        function selectQuizOption(qIndex, optIndex) {
            state.quizSelectedOptions[qIndex] = optIndex;
            const lesson = getCurrentLessonData();
            lesson.quiz[qIndex].options.forEach((_, i) => {
                const el = document.getElementById(`opt-${qIndex}-${i}`);
                if (el) el.classList.remove("selected");
            });
            const selectedEl = document.getElementById(`opt-${qIndex}-${optIndex}`);
            if (selectedEl) selectedEl.classList.add("selected");
        }

        function submitQuiz() {
            const lesson = getCurrentLessonData();
            let allCorrect = true;

            lesson.quiz.forEach((q, qIndex) => {
                const userChoice = state.quizSelectedOptions[qIndex];
                const feedbackEl = document.getElementById(`feedback-${qIndex}`);
                feedbackEl.style.display = "block";

                if (userChoice === undefined) {
                    feedbackEl.style.background = "rgba(239, 68, 68, 0.1)";
                    feedbackEl.style.color = "var(--danger)";
                    feedbackEl.innerText = "⚠️ Por favor, selecciona una opción.";
                    allCorrect = false;
                    return;
                }

                q.options.forEach((_, optIdx) => {
                    const optEl = document.getElementById(`opt-${qIndex}-${optIdx}`);
                    optEl.classList.remove("correct", "incorrect");
                    if (optIdx === q.correct) optEl.classList.add("correct");
                    if (optIdx === userChoice && userChoice !== q.correct) optEl.classList.add("incorrect");
                });

                if (userChoice === q.correct) {
                    feedbackEl.style.background = "rgba(16, 185, 129, 0.15)";
                    feedbackEl.style.color = "#6ee7b7";
                    feedbackEl.innerHTML = `<strong>¡Correcto!</strong> ${q.explanation}`;
                } else {
                    feedbackEl.style.background = "rgba(239, 68, 68, 0.15)";
                    feedbackEl.style.color = "#fca5a5";
                    feedbackEl.innerHTML = `<strong>Incorrecto.</strong> ${q.explanation}`;
                    allCorrect = false;
                }
            });

            if (allCorrect) {
                if (!state.completedLessons.has(lesson.id)) {
                    state.completedLessons.add(lesson.id);
                    state.quizScores += 50;
                    renderSidebar();
                }
            }
        }

        /* ==========================================================
           ACTIVITY CHECKER
        ========================================================== */
        function runActivityCheck() {
            const lesson = getCurrentLessonData();
            const input = document.getElementById("activityInput").value.trim();
            const output = document.getElementById("consoleOutput");

            if (!input) {
                output.innerText = "❌ Error: El editor está vacío. Escribe tu código o instrucción.";
                output.style.color = "var(--danger)";
                return;
            }

            const reqKeywords = lesson.activity.solutionKeywords;
            const passed = reqKeywords.every(kw => input.toUpperCase().includes(kw.toUpperCase()));

            if (passed) {
                output.innerText = `✅ [COMPILACIÓN EXITOSA]\n> Salida validada correctamente.\n> Conceptos detectados: ${reqKeywords.join(", ")}.\n> ¡Excelente trabajo en la implementación!`;
                output.style.color = "var(--success)";
                
                // Complete lesson on practical success too
                if (!state.completedLessons.has(lesson.id)) {
                    state.completedLessons.add(lesson.id);
                    state.quizScores += 25;
                    renderSidebar();
                }
            } else {
                output.innerText = `⚠️ [VERIFICACIÓN FALLIDA]\n> Falta incluir elementos clave como: ${reqKeywords.join(" o ")}.\n> Pista: ${lesson.activity.hint}`;
                output.style.color = "var(--warning)";
            }
        }

        function resetActivity() {
            document.getElementById("activityInput").value = "";
            const output = document.getElementById("consoleOutput");
            output.innerText = "Terminal reiniciada.";
            output.style.color = "var(--text-muted)";
        }

        /* ==========================================================
           TAB SYSTEM & PROGRESS
        ========================================================== */
        function switchTab(tabId) {
            document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
            document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));

            if (tabId === 'lesson') {
                document.querySelectorAll(".tab-btn")[0].classList.add("active");
                document.getElementById("pane-lesson").classList.add("active");
            } else if (tabId === 'activity') {
                document.querySelectorAll(".tab-btn")[1].classList.add("active");
                document.getElementById("pane-activity").classList.add("active");
            } else if (tabId === 'evaluation') {
                document.querySelectorAll(".tab-btn")[2].classList.add("active");
                document.getElementById("pane-evaluation").classList.add("active");
            }
        }

        function updateProgressStats() {
            let totalLessons = 0;
            curriculum.forEach(m => totalLessons += m.lessons.length);
            const completedCount = state.completedLessons.size;
            const pct = Math.round((completedCount / totalLessons) * 100);

            document.getElementById("overallProgressFill").style.width = `${pct}%`;
            document.getElementById("overallProgressText").innerText = `${pct}%`;
            document.getElementById("completedLessonsCount").innerText = `${completedCount} / ${totalLessons}`;
            document.getElementById("quizScoreText").innerText = `${state.quizScores} XP`;
        }

        /* ==========================================================
           INIT APPLICATION
        ========================================================== */
        window.addEventListener("DOMContentLoaded", () => {
            initFatigueSystem();
            renderSidebar();
            loadLessonContent();
            updateEnergyDisplay();
        });