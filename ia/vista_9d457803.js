// --- 1. Gestor de Idiomas / Palabras dinámicas ---
        const greetings = [
            { word: "Hola", lang: "Español" },
            { word: "Hello", lang: "English" },
            { word: "Bonjour", lang: "Français" },
            { word: "Ciao", lang: "Italiano" },
            { word: "Konnichiwa", lang: "日本語" },
            { word: "Olá", lang: "Português" },
            { word: "Hallo", lang: "Deutsch" }
        ];
        let currentGreetingIndex = 0;
        const greetingElement = document.getElementById('greetingWord');

        function changeGreeting() {
            currentGreetingIndex = (currentGreetingIndex + 1) % greetings.length;
            greetingElement.style.transform = 'scale(0.8) translateY(-10px)';
            greetingElement.style.opacity = '0';
            
            setTimeout(() => {
                greetingElement.textContent = greetings[currentGreetingIndex].word;
                greetingElement.style.transform = 'scale(1) translateY(0)';
                greetingElement.style.opacity = '1';
            }, 200);

            playSound(520 + (currentGreetingIndex * 60));
        }

        document.getElementById('btnExplorar').addEventListener('click', changeGreeting);

        // --- 2. Contador de Saludos y Efecto Toast ---
        let count = 1024;
        const counterEl = document.getElementById('saludoCount');
        const toast = document.getElementById('toast');
        let toastTimeout;

        function triggerGreeting() {
            count++;
            counterEl.textContent = count.toLocaleString();
            
            // Animación en el contador
            counterEl.style.transform = 'scale(1.1)';
            counterEl.style.color = 'var(--accent-1)';
            setTimeout(() => {
                counterEl.style.transform = 'scale(1)';
                counterEl.style.color = '#fff';
            }, 200);

            // Generar chispas / partículas en el click
            createBurst(window.innerWidth / 2, window.innerHeight / 2);

            // Notificación Toast
            toast.classList.add('show');
            clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => {
                toast.classList.remove('show');
            }, 2500);

            // Sonido agradable
            playHarmony();
        }

        document.getElementById('btnSaludar').addEventListener('click', triggerGreeting);
        document.getElementById('counterCard').addEventListener('click', triggerGreeting);

        // --- 3. Selector de Tema ---
        const themePills = document.querySelectorAll('.pill');
        themePills.forEach(pill => {
            pill.addEventListener('click', (e) => {
                themePills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                
                const theme = pill.getAttribute('data-set-theme');
                if (theme === 'default') {
                    document.documentElement.removeAttribute('data-theme');
                } else {
                    document.documentElement.setAttribute('data-theme', theme);
                }
                playSound(440);
            });
        });

        // --- 4. Web Audio API (Sintetizador minimalista para interacción) ---
        let audioCtx = null;
        let soundEnabled = true;

        function initAudio() {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
        }

        function playSound(freq = 440) {
            if (!soundEnabled) return;
            initAudio();
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 0.5);
        }

        function playHarmony() {
            if (!soundEnabled) return;
            [523.25, 659.25, 783.99].forEach((freq, index) => {
                setTimeout(() => playSound(freq), index * 80);
            });
        }

        const soundBtn = document.getElementById('soundBtn');
        soundBtn.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            soundBtn.style.opacity = soundEnabled ? '1' : '0.4';
            if(soundEnabled) playSound(600);
        });

        // --- 5. Efecto Tilt 3D en las tarjetas ---
        const cards = document.querySelectorAll('.interactive-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);

                if (card.classList.contains('tilt-card')) {
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = ((y - centerY) / centerY) * -7;
                    const rotateY = ((x - centerX) / centerX) * 7;
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            });
        });

        // --- 6. Canvas interactivo de partículas en el fondo ---
        const canvas = document.getElementById('bgCanvas');
        const ctx = canvas.getContext('2d');

        let particles = [];
        let mouse = { x: null, y: null, radius: 150 };

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        }

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.baseX = this.x;
                this.baseY = this.y;
                this.speed = Math.random() * 0.5 + 0.2;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.alpha = Math.random() * 0.5 + 0.2;
            }

            draw() {
                ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

                // Repulsión con el cursor
                if (mouse.x != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        let force = (mouse.radius - distance) / mouse.radius;
                        let directionX = (dx / distance) * force * 3;
                        let directionY = (dy / distance) * force * 3;
                        this.x -= directionX;
                        this.y -= directionY;
                    }
                }
            }
        }

        function initParticles() {
            particles = [];
            const count = Math.floor((canvas.width * canvas.height) / 12000);
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }

        // Explosión de partículas al saludar
        function createBurst(x, y) {
            for (let i = 0; i < 20; i++) {
                let p = new Particle();
                p.x = x;
                p.y = y;
                p.vx = (Math.random() - 0.5) * 8;
                p.vy = (Math.random() - 0.5) * 8;
                p.size = Math.random() * 3 + 1;
                p.alpha = 1;
                particles.push(p);
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((particle, index) => {
                particle.update();
                particle.draw();
                // Limpiar partículas extras creadas por ráfagas
                if (particles.length > 150 && particle.alpha < 0.1) {
                    particles.splice(index, 1);
                }
            });
            requestAnimationFrame(animate);
        }

        // Iniciar
        resizeCanvas();
        animate();
        document.getElementById('year').textContent = new Date().getFullYear();