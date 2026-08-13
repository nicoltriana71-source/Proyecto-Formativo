// Elementos DOM
        const themeToggleBtn = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');
        const connectBtn = document.getElementById('connectBtn');
        const btnText = document.getElementById('btnText');
        const btnIcon = document.getElementById('btnIcon');
        const connectionsCount = document.getElementById('connectionsCount');
        const contactBtn = document.getElementById('contactBtn');
        const contactModal = document.getElementById('contactModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');

        // SVGs para el tema
        const moonSVG = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>`;
        const sunSVG = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>`;

        // SVGs para el botón de Conexión
        const checkSVG = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>`;
        const userAddSVG = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>`;

        // Estado
        let isConnected = false;
        let baseCount = 142;

        // 1. Control del Modo Claro / Oscuro
        function initTheme() {
            const savedTheme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
                document.documentElement.setAttribute('data-theme', 'dark');
                themeIcon.innerHTML = sunSVG;
            } else {
                document.documentElement.removeAttribute('data-theme');
                themeIcon.innerHTML = moonSVG;
            }
        }

        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                themeIcon.innerHTML = moonSVG;
                localStorage.setItem('theme', 'light');
                showToast('Modo claro activado ☀️');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                themeIcon.innerHTML = sunSVG;
                localStorage.setItem('theme', 'dark');
                showToast('Modo oscuro activado 🌙');
            }
        });

        // 2. Botón Interactivo de Conexión
        connectBtn.addEventListener('click', () => {
            isConnected = !isConnected;

            if (isConnected) {
                connectBtn.classList.add('connected');
                btnText.textContent = 'Conectado';
                btnIcon.innerHTML = checkSVG;
                connectionsCount.textContent = baseCount + 1;
                showToast('¡Te has conectado con Sofía! 🎉');
            } else {
                connectBtn.classList.remove('connected');
                btnText.textContent = 'Conectar';
                btnIcon.innerHTML = userAddSVG;
                connectionsCount.textContent = baseCount;
                showToast('Conexión cancelada');
            }
        });

        // 3. Sistema de Notificaciones Toast
        let toastTimeout;
        function showToast(msg) {
            clearTimeout(toastTimeout);
            toastMessage.textContent = msg;
            toast.classList.add('show');
            
            toastTimeout = setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        // 4. Modal de Mensaje
        contactBtn.addEventListener('click', () => {
            contactModal.classList.add('active');
        });

        closeModalBtn.addEventListener('click', () => {
            contactModal.classList.remove('active');
        });

        contactModal.addEventListener('click', (e) => {
            if (e.target === contactModal) {
                contactModal.classList.remove('active');
            }
        });

        // 5. Interactividad en los badges de habilidades
        const skillPills = document.querySelectorAll('.skill-pill');
        skillPills.forEach(pill => {
            pill.addEventListener('click', () => {
                showToast(`Filtro: ${pill.innerText}`);
            });
        });

        // Inicializar
        initTheme();