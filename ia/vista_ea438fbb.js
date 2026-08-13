// DATA: Complete Algebra Syllabus with Practice Quizzes
        const algebraCurriculum = [
            {
                id: "m1",
                number: "01",
                title: "Fundamentos y Lenguaje Algebraico",
                level: "básico",
                description: "Introducción a variables, términos semejantes, leyes de signos y jerarquía de operaciones.",
                lessons: [
                    { 
                        id: "l1_1", 
                        title: "Conjuntos numéricos y recta real", 
                        time: "45m",
                        quiz: {
                            q: "¿A qué conjunto pertenece el número -7?",
                            opts: ["Naturales (N)", "Enteros (Z) y Racionales (Q)", "Irracionales (I)", "Solo Naturales"],
                            correct: 1,
                            exp: "¡Correcto! -7 es un número entero negativo y también racional (-7/1)."
                        }
                    },
                    { 
                        id: "l1_2", 
                        title: "Variables, coeficientes y expresiones algebraicas", 
                        time: "50m",
                        quiz: {
                            q: "En el término algebraico -5x³y², ¿cuál es el coeficiente principal?",
                            opts: ["3", "-5", "2", "5"],
                            correct: 1,
                            exp: "¡Exacto! El coeficiente numérico con su signo es -5."
                        }
                    },
                    { 
                        id: "l1_3", 
                        title: "Leyes de los exponentes y radicales", 
                        time: "1h 15m",
                        quiz: {
                            q: "Simplifica: (2x³)(4x⁵)",
                            opts: ["8x¹⁵", "6x⁸", "8x⁸", "8x²"],
                            correct: 2,
                            exp: "¡Muy bien! Se multiplican coeficientes (2·4=8) y se suman exponentes (3+5=8)."
                        }
                    },
                    { 
                        id: "l1_4", 
                        title: "Reducción de términos semejantes y signos de agrupación", 
                        time: "1h",
                        quiz: {
                            q: "Reduce: 4x - [2x - (3x - 1)]",
                            opts: ["5x - 1", "3x + 1", "5x + 1", "-x - 1"],
                            correct: 0,
                            exp: "¡Excelente! 4x - [2x - 3x + 1] = 4x - [-x + 1] = 4x + x - 1 = 5x - 1."
                        }
                    }
                ]
            },
            {
                id: "m2",
                number: "02",
                title: "Polinomios y Operaciones",
                level: "básico",
                description: "Dominio de operaciones elementales con polinomios, productos notables y algoritmo de la división.",
                lessons: [
                    { 
                        id: "l2_1", 
                        title: "Suma y resta de polinomios", 
                        time: "45m",
                        quiz: {
                            q: "Suma (3x² + 2x - 5) + (x² - 4x + 7):",
                            opts: ["4x² - 2x + 2", "4x² + 6x - 12", "3x² - 2x + 2", "4x² - 2x - 2"],
                            correct: 0,
                            exp: "¡Correcto! Sumando términos semejantes: (3+1)x² + (2-4)x + (-5+7) = 4x² - 2x + 2."
                        }
                    },
                    { 
                        id: "l2_2", 
                        title: "Multiplicación y Productos Notables", 
                        time: "1h 30m",
                        quiz: {
                            q: "Desarrolla el binomio al cuadrado: (2x - 3)²",
                            opts: ["4x² - 9", "4x² - 12x + 9", "4x² + 12x + 9", "2x² - 6x + 9"],
                            correct: 1,
                            exp: "¡Correcto! (a - b)² = a² - 2ab + b² -> (2x)² - 2(2x)(3) + 3² = 4x² - 12x + 9."
                        }
                    },
                    { 
                        id: "l2_3", 
                        title: "División de polinomios y Regla de Ruffini", 
                        time: "1h 15m",
                        quiz: {
                            q: "¿Cuándo es aplicable la Regla de Ruffini (división sintética)?",
                            opts: ["Solo para monomios", "Cuando el divisor es de la forma (x ± a)", "Solo si el dividendo es de grado 2", "Para cualquier polinomio divisor"],
                            correct: 1,
                            exp: "¡Perfecto! Ruffini se usa cuando el divisor es un binomio lineal de la forma x - c."
                        }
                    },
                    { 
                        id: "l2_4", 
                        title: "Teorema del Residuo y del Factor", 
                        time: "50m",
                        quiz: {
                            q: "Si P(x) = x³ - 2x + 4, el residuo al dividir entre (x - 2) es:",
                            opts: ["8", "0", "4", "12"],
                            correct: 0,
                            exp: "¡Bien! Por el teorema del residuo: P(2) = 2³ - 2(2) + 4 = 8 - 4 + 4 = 8."
                        }
                    }
                ]
            },
            {
                id: "m3",
                number: "03",
                title: "Factorización y Fracciones Algebraicas",
                level: "intermedio",
                description: "Técnicas completas de factorización para simplificar fracciones algebraicas y expresiones complejas.",
                lessons: [
                    { 
                        id: "l3_1", 
                        title: "Factor común (monomio y polinomio)", 
                        time: "1h",
                        quiz: {
                            q: "Factoriza: 6x³y² - 9x²y³",
                            opts: ["3xy(2x² - 3y²)", "3x²y²(2x - 3y)", "x²y²(6x - 9y)", "3x³y³(2 - 3)"],
                            correct: 1,
                            exp: "¡Correcto! El MCD de 6 y 9 es 3, y las variables con menor exponente son x² e y²."
                        }
                    },
                    { 
                        id: "l3_2", 
                        title: "Diferencia de cuadrados y trinomios cuadrados perfectos", 
                        time: "1h 15m",
                        quiz: {
                            q: "Factoriza completamente: 49x² - 36",
                            opts: ["(7x - 6)²", "(49x - 1)(x + 36)", "(7x + 6)(7x - 6)", "(7x - 18)(7x + 2)"],
                            correct: 2,
                            exp: "¡Exacto! a² - b² = (a+b)(a-b). Con a = 7x y b = 6."
                        }
                    },
                    { 
                        id: "l3_3", 
                        title: "Trinomios de la forma x² + bx + c y ax² + bx + c", 
                        time: "1h 30m",
                        quiz: {
                            q: "Factoriza: x² - 5x + 6",
                            opts: ["(x - 3)(x - 2)", "(x - 6)(x + 1)", "(x + 3)(x + 2)", "(x - 1)(x - 5)"],
                            correct: 0,
                            exp: "¡Genial! Buscamos dos números que multiplicados den +6 y sumados den -5: (-3) y (-2)."
                        }
                    },
                    { 
                        id: "l3_4", 
                        title: "Simplificación y operaciones con fracciones racionales", 
                        time: "1h 20m",
                        quiz: {
                            q: "Simplifica: (x² - 9) / (x² + 3x)",
                            opts: ["(x - 3) / x", "-9 / 3x", "(x + 3) / x", "x - 3"],
                            correct: 0,
                            exp: "¡Correcto! (x+3)(x-3) / [x(x+3)] = (x-3)/x tras cancelar el factor común (x+3)."
                        }
                    }
                ]
            },
            {
                id: "m4",
                number: "04",
                title: "Ecuaciones Lineales y Cuadráticas",
                level: "intermedio",
                description: "Resolución de ecuaciones de primer y segundo grado, análisis del discriminante y problemas de aplicación.",
                lessons: [
                    { 
                        id: "l4_1", 
                        title: "Ecuaciones de 1er grado con una incógnita", 
                        time: "1h",
                        quiz: {
                            q: "Resuelve: 3(x - 4) = 2x + 5",
                            opts: ["x = 9", "x = 17", "x = 7", "x = -17"],
                            correct: 1,
                            exp: "¡Correcto! 3x - 12 = 2x + 5 => 3x - 2x = 5 + 12 => x = 17."
                        }
                    },
                    { 
                        id: "l4_2", 
                        title: "Modelado y resolución de problemas aplicados", 
                        time: "1h 15m",
                        quiz: {
                            q: "La suma de dos números consecutivos es 47. ¿Cuál es el mayor?",
                            opts: ["23", "24", "25", "22"],
                            correct: 1,
                            exp: "¡Exacto! x + (x + 1) = 47 => 2x = 46 => x = 23. El mayor es 23 + 1 = 24."
                        }
                    },
                    { 
                        id: "l4_3", 
                        title: "Ecuaciones cuadráticas por factorización y fórmula general", 
                        time: "1h 45m",
                        quiz: {
                            q: "Las soluciones de x² - 7x + 12 = 0 son:",
                            opts: ["x = 3, x = 4", "x = -3, x = -4", "x = 2, x = 6", "x = -2, x = -6"],
                            correct: 0,
                            exp: "¡Correcto! (x - 3)(x - 4) = 0 => x = 3 o x = 4."
                        }
                    },
                    { 
                        id: "l4_4", 
                        title: "Análisis del Discriminante y raíces complejas", 
                        time: "1h",
                        quiz: {
                            q: "Si Δ = b² - 4ac < 0, la ecuación cuadrática tiene:",
                            opts: ["Dos soluciones reales iguales", "Dos soluciones reales distintas", "Dos soluciones complejas conjugadas", "No tiene solución"],
                            correct: 2,
                            exp: "¡Correcto! Un discriminante negativo produce la raíz cuadrada de un número negativo (números complejos)."
                        }
                    }
                ]
            },
            {
                id: "m5",
                number: "05",
                title: "Sistemas de Ecuaciones e Inecuaciones",
                level: "intermedio",
                description: "Métodos algebraicos (sustitución, igualación, eliminación), regla de Cramer y desigualdades lineales.",
                lessons: [
                    { 
                        id: "l5_1", 
                        title: "Sistemas 2x2: Métodos algebraicos", 
                        time: "1h 30m",
                        quiz: {
                            q: "Dado { x + y = 10, x - y = 2 }, el valor del par (x, y) es:",
                            opts: ["(5, 5)", "(6, 4)", "(7, 3)", "(8, 2)"],
                            correct: 1,
                            exp: "¡Correcto! Sumando ambas: 2x = 12 => x = 6. Luego y = 10 - 6 = 4."
                        }
                    },
                    { 
                        id: "l5_2", 
                        title: "Sistemas 3x3 y Regla de Cramer (Determinantes)", 
                        time: "1h 45m",
                        quiz: {
                            q: "Calcula el determinante: | 3  2 | / | 1  4 |",
                            opts: ["10", "14", "12", "-10"],
                            correct: 0,
                            exp: "¡Bien! (3 · 4) - (2 · 1) = 12 - 2 = 10."
                        }
                    },
                    { 
                        id: "l5_3", 
                        title: "Inecuaciones lineales en una variable y notación de intervalos", 
                        time: "1h",
                        quiz: {
                            q: "Resuelve: -2x < 6",
                            opts: ["x < -3", "x > -3", "x > 3", "x < 3"],
                            correct: 1,
                            exp: "¡Cuidado con la regla de oro! Al dividir entre un negativo (-2), el sentido de la desigualdad cambia: x > -3."
                        }
                    },
                    { 
                        id: "l5_4", 
                        title: "Inecuaciones con valor absoluto", 
                        time: "1h 15m",
                        quiz: {
                            q: "|x| ≤ 5 equivale al intervalo:",
                            opts: ["[-5, 5]", "(-∞, -5] ∪ [5, ∞)", "[0, 5]", "(-5, 5)"],
                            correct: 0,
                            exp: "¡Correcto! |x| ≤ k representa distancias menores o iguales a k desde el origen: -5 ≤ x ≤ 5."
                        }
                    }
                ]
            },
            {
                id: "m6",
                number: "06",
                title: "Funciones y Gráficas",
                level: "avanzado",
                description: "Concepto de función, dominio, rango, transformaciones y familias de funciones algebraicas.",
                lessons: [
                    { 
                        id: "l6_1", 
                        title: "Concepto formal de función, dominio y rango", 
                        time: "1h 15m",
                        quiz: {
                            q: "¿Cuál es el dominio de f(x) = 1 / (x - 4)?",
                            opts: ["Todos los reales", "Reales excepto x = 0", "Reales excepto x = 4", "[4, ∞)"],
                            correct: 2,
                            exp: "¡Excelente! La división por cero no existe, por tanto x - 4 ≠ 0 => x ≠ 4."
                        }
                    },
                    { 
                        id: "l6_2", 
                        title: "Función lineal: pendiente, ordenada y gráfica", 
                        time: "1h",
                        quiz: {
                            q: "¿Cuál es la pendiente de la recta perpendicular a y = 2x + 1?",
                            opts: ["2", "-2", "1/2", "-1/2"],
                            correct: 3,
                            exp: "¡Correcto! Las pendientes perpendiculares son recíprocas y de signo opuesto: m₂ = -1/m₁ = -1/2."
                        }
                    },
                    { 
                        id: "l6_3", 
                        title: "Función cuadrática: vértice, eje de simetría e interceptos", 
                        time: "1h 30m",
                        quiz: {
                            q: "¿Cuál es la coordenada 'x' del vértice de f(x) = x² - 6x + 8?",
                            opts: ["x = 3", "x = -3", "x = 6", "x = 4"],
                            correct: 0,
                            exp: "¡Bien! x_v = -b / (2a) = -(-6) / (2·1) = 6 / 2 = 3."
                        }
                    },
                    { 
                        id: "l6_4", 
                        title: "Operaciones con funciones y composición (f ∘ g)(x)", 
                        time: "1h 15m",
                        quiz: {
                            q: "Si f(x) = 2x y g(x) = x + 3, halla (f ∘ g)(2):",
                            opts: ["7", "10", "13", "8"],
                            correct: 1,
                            exp: "¡Perfecto! g(2) = 2 + 3 = 5. Luego f(5) = 2(5) = 10."
                        }
                    }
                ]
            },
            {
                id: "m7",
                number: "07",
                title: "Álgebra Lineal Básica y Matrices",
                level: "avanzado",
                description: "Operaciones matriciales, matrices inversas, determinantes de orden superior y espacios vectoriales básicos.",
                lessons: [
                    { 
                        id: "l7_1", 
                        title: "Matrices: dimensiones y operaciones (suma y producto escalar)", 
                        time: "1h",
                        quiz: {
                            q: "Si la matriz A es 2x3 y B es 3x2, ¿cuál es la dimensión de A · B?",
                            opts: ["3x3", "2x2", "2x3", "No se pueden multiplicar"],
                            correct: 1,
                            exp: "¡Correcto! El producto de (m x k) por (k x n) resulta en una matriz de tamaño (m x n), es decir, 2x2."
                        }
                    },
                    { 
                        id: "l7_2", 
                        title: "Multiplicación de matrices y propiedades", 
                        time: "1h 30m",
                        quiz: {
                            q: "¿Es la multiplicación de matrices conmutativa en general (A · B = B · A)?",
                            opts: ["Siempre", "Nunca", "No, en general A · B ≠ B · A", "Solo si son de dimensión 2x2"],
                            correct: 2,
                            exp: "¡Excelente! La multiplicación matricial NO es conmutativa."
                        }
                    },
                    { 
                        id: "l7_3", 
                        title: "Matriz inversa y método de Gauss-Jordan", 
                        time: "1h 45m",
                        quiz: {
                            q: "Una matriz cuadrada tiene inversa si y solo si:",
                            opts: ["Su determinante es cero", "Su determinante es distinto de cero", "Es simétrica", "Todos sus elementos son positivos"],
                            correct: 1,
                            exp: "¡Correcto! Si det(A) = 0, la matriz es singular y no posee inversa."
                        }
                    },
                    { 
                        id: "l7_4", 
                        title: "Números Complejos: forma binómica y polar", 
                        time: "1h 15m",
                        quiz: {
                            q: "¿Cuál es el valor de i² (unidad imaginaria)?",
                            opts: ["1", "-1", "i", "-i"],
                            correct: 1,
                            exp: "¡Exacto! Por definición i = √(-1), por ende i² = -1."
                        }
                    }
                ]
            }
        ];

        // STATE MANAGEMENT
        let completedLessons = JSON.r || JSON.parse(localStorage.getItem('algebra_progress_tracker') || '[]');
        let currentFilter = 'all';

        // DOM ELEMENTS
        const modulesContainer = document.getElementById('modulesContainer');
        const mainProgressBar = document.getElementById('main-progress-bar');
        const mainPercentage = document.getElementById('main-percentage');
        const completedCountText = document.getElementById('completed-count-text');
        const statusBadgeText = document.getElementById('status-badge-text');

        // TOTAL LESSONS COUNT
        const totalLessonsCount = algebraCurriculum.reduce((acc, m) => acc + m.lessons.length, 0);

        // INITIALIZE
        document.addEventListener('DOMContentLoaded', () => {
            renderModules();
            updateProgressStats();
            calculateStudyPace();
        });

        // RENDER MODULES
        function renderModules() {
            const query = document.getElementById('searchInput').value.toLowerCase().trim();
            modulesContainer.innerHTML = '';

            algebraCurriculum.forEach((mod, modIdx) => {
                // Check filtering
                const matchesFilter = currentFilter === 'all' || mod.level === currentFilter;
                
                // Check search filter inside lessons
                const matchingLessons = mod.lessons.filter(l => 
                    l.title.toLowerCase().includes(query) || 
                    mod.title.toLowerCase().includes(query)
                );

                if (!matchesFilter || (query && matchingLessons.length === 0)) {
                    return;
                }

                // Check completed lessons count in this module
                const modCompleted = mod.lessons.filter(l => completedLessons.includes(l.id)).length;
                const isModAllDone = modCompleted === mod.lessons.length && mod.lessons.length > 0;

                const modCard = document.createElement('div');
                modCard.className = `module-card ${isModAllDone ? 'completed' : ''} ${modIdx === 0 ? 'expanded' : ''}`;
                modCard.id = `mod-card-${mod.id}`;

                let badgeClass = 'badge-basic';
                if (mod.level === 'intermedio') badgeClass = 'badge-intermediate';
                if (mod.level === 'avanzado') badgeClass = 'badge-advanced';

                modCard.innerHTML = `
                    <div class="module-header" onclick="toggleModule('${mod.id}')">
                        <div class="module-info">
                            <div class="module-num">${mod.number}</div>
                            <div class="module-title-area">
                                <h3>${mod.title}</h3>
                                <div class="module-tags">
                                    <span class="badge ${badgeClass}">${mod.level}</span>
                                    <span style="color: var(--text-dim);">&bull;</span>
                                    <span style="color: var(--text-muted);">${mod.lessons.length} temas</span>
                                </div>
                            </div>
                        </div>
                        <div class="module-meta-right">
                            <span class="module-completion-pill" id="mod-pill-${mod.id}">${modCompleted}/${mod.lessons.length}</span>
                            <svg class="chevron-icon" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                    </div>
                    <div class="module-body">
                        <p class="module-desc">${mod.description}</p>
                        <div class="lessons-grid">
                            ${mod.lessons.map(lesson => {
                                const isDone = completedLessons.includes(lesson.id);
                                return `
                                    <div class="lesson-item ${isDone ? 'done' : ''}" id="item-${lesson.id}">
                                        <div class="lesson-left" onclick="toggleLesson('${lesson.id}', event)">
                                            <label class="custom-checkbox" onclick="event.stopPropagation()">
                                                <input type="checkbox" ${isDone ? 'checked' : ''} onchange="toggleLesson('${lesson.id}')">
                                                <span class="checkmark"></span>
                                            </label>
                                            <span class="lesson-title">${lesson.title}</span>
                                        </div>
                                        <div class="lesson-actions">
                                            <span class="lesson-duration">${lesson.time}</span>
                                            <button class="btn-quiz" onclick="openQuiz('${mod.id}', '${lesson.id}')">Quiz</button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;

                modulesContainer.appendChild(modCard);
            });
        }

        // TOGGLE MODULE ACCORDION
        function toggleModule(modId) {
            const card = document.getElementById(`mod-card-${modId}`);
            if (card) {
                card.classList.toggle('expanded');
            }
        }

        // TOGGLE LESSON CHECKBOX
        function toggleLesson(lessonId, event) {
            if (event && event.target.tagName === 'INPUT') return;

            if (completedLessons.includes(lessonId)) {
                completedLessons = completedLessons.filter(id => id !== lessonId);
            } else {
                completedLessons.push(lessonId);
            }

            localStorage.setItem('algebra_progress_tracker', JSON.stringify(completedLessons));
            
            // Re-render UI states
            updateProgressStats();
            
            // Update individual item class
            const item = document.getElementById(`item-${lessonId}`);
            if (item) {
                const isChecked = completedLessons.includes(lessonId);
                item.classList.toggle('done', isChecked);
                const cb = item.querySelector('input[type="checkbox"]');
                if (cb) cb.checked = isChecked;
            }

            // Update module pills and border indicator
            algebraCurriculum.forEach(mod => {
                const modCompleted = mod.lessons.filter(l => completedLessons.includes(l.id)).length;
                const pill = document.getElementById(`mod-pill-${mod.id}`);
                if (pill) pill.innerText = `${modCompleted}/${mod.lessons.length}`;
                
                const card = document.getElementById(`mod-card-${mod.id}`);
                if (card) {
                    card.classList.toggle('completed', modCompleted === mod.lessons.length && mod.lessons.length > 0);
                }
            });
        }

        // UPDATE PROGRESS STATS & BAR
        function updateProgressStats() {
            const completedCount = completedLessons.length;
            const percentage = totalLessonsCount === 0 ? 0 : Math.round((completedCount / totalLessonsCount) * 100);

            mainProgressBar.style.width = `${percentage}%`;
            mainPercentage.innerText = `${percentage}%`;
            completedCountText.innerText = `${completedCount} de ${totalLessonsCount} completadas`;

            // Status message
            if (percentage === 0) statusBadgeText.innerText = "Iniciando camino";
            else if (percentage < 30) statusBadgeText.innerText = "Nivel Principiante";
            else if (percentage < 70) statusBadgeText.innerText = "Nivel Intermedio";
            else if (percentage < 100) statusBadgeText.innerText = "Nivel Avanzado";
            else statusBadgeText.innerText = "¡Álgebra Dominada! 🎓";
        }

        // FILTERS & SEARCH
        function setFilter(level, btn) {
            currentFilter = level;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderModules();
        }

        function filterLessons() {
            renderModules();
        }

        // PACE CALCULATOR
        function calculateStudyPace() {
            const hours = parseInt(document.getElementById('studyHoursSelect').value, 10);
            const totalHours = 45;
            const remainingLessons = totalLessonsCount - completedLessons.length;
            const remainingHours = Math.round((remainingLessons / totalLessonsCount) * totalHours);
            const weeksRemaining = (remainingHours / hours).toFixed(1);

            document.getElementById('paceResult').innerHTML = `
                Dedicando <strong>${hours}h por semana</strong>, te quedan <strong>${remainingHours} horas</strong> de estudio. Finalizarás en aprox. <strong>${weeksRemaining} semanas</strong>.
            `;
        }

        // RESET PROGRESS
        function resetProgress() {
            if (confirm("¿Deseas reiniciar todo tu progreso de estudio?")) {
                completedLessons = [];
                localStorage.removeItem('algebra_progress_tracker');
                renderModules();
                updateProgressStats();
                calculateStudyPace();
            }
        }

        // MODAL HANDLERS
        function openFormulaModal() {
            document.getElementById('formulaModal').classList.add('active');
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
        }

        // Close on background click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.classList.remove('active');
            }
        });

        // QUIZ SYSTEM
        let activeQuizData = null;
        let activeLessonId = null;

        function openQuiz(modId, lessonId) {
            const mod = algebraCurriculum.find(m => m.id === modId);
            if (!mod) return;
            const lesson = mod.lessons.find(l => l.id === lessonId);
            if (!lesson || !lesson.quiz) return;

            activeQuizData = lesson.quiz;
            activeLessonId = lessonId;

            document.getElementById('quizTopicTitle').innerText = lesson.title;
            document.getElementById('quizQuestionText').innerText = lesson.quiz.q;
            document.getElementById('quizFeedback').innerHTML = '';

            const container = document.getElementById('quizOptionsContainer');
            container.innerHTML = '';

            lesson.quiz.opts.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = 'quiz-opt-btn';
                btn.innerText = opt;
                btn.onclick = () => selectQuizOption(idx, btn);
                container.appendChild(btn);
            });

            document.getElementById('quizModal').classList.add('active');
        }

        function selectQuizOption(chosenIdx, btnElement) {
            const allBtns = document.querySelectorAll('.quiz-opt-btn');
            allBtns.forEach(b => b.disabled = true);

            const feedback = document.getElementById('quizFeedback');
            if (chosenIdx === activeQuizData.correct) {
                btnElement.classList.add('correct');
                feedback.style.color = 'var(--accent-emerald)';
                feedback.innerHTML = `✓ ${activeQuizData.exp}`;
                
                // If not already marked as completed, mark it!
                if (!completedLessons.includes(activeLessonId)) {
                    toggleLesson(activeLessonId);
                }
            } else {
                btnElement.classList.add('wrong');
                allBtns[activeQuizData.correct].classList.add('correct');
                feedback.style.color = 'var(--accent-rose)';
                feedback.innerHTML = `✗ Respuesta incorrecta. Revisa la opción destacada en verde.`;
            }
        }