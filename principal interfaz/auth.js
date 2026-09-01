/* ============================================================
   StudNova — Autenticación del lado del cliente
   Registro, inicio de sesión y sesión persistente usando
   localStorage. Pensado como prototipo funcional para el
   proyecto formativo (sin backend real todavía).
   ============================================================ */



   (function () {
  "use strict";

  /* ---------- Almacenamiento ---------- */
  const STORAGE_USERS = "studnova:users";
  const STORAGE_SESSION = "studnova:session";

  function getUsers() {
    try {
      const raw = localStorage.getItem(STORAGE_USERS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("No se pudieron leer los usuarios guardados:", e);
      return [];
    }
  }

  function saveUsers(users) {
    try {
      localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
      return true;
    } catch (e) {
      console.error("No se pudo guardar el usuario:", e);
      return false;
    }
  }

  function getSession() {
    try {
      const raw = localStorage.getItem(STORAGE_SESSION);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setSession(email) {
    localStorage.setItem(STORAGE_SESSION, JSON.stringify({ email, since: Date.now() }));
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_SESSION);
  }

  /* ---------- Utilidades de cifrado simple (demo) ----------
     Esto NO es cifrado seguro de verdad: es un hash simple solo
     para que la contraseña no quede en texto plano en localStorage
     durante la demo. En el sistema real (RNF-002) esto lo haría
     el backend con bcrypt/argon2 u otro algoritmo robusto. */
  function simpleHash(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    return "h" + Math.abs(hash).toString(36) + text.length;
  }

  /* ---------- Helpers de validación ---------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function isValidEmail(value) {
    return EMAIL_RE.test(value.trim());
  }

  function passwordStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score; // 0-4
  }

  function initials(name) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  /* ============================================================
     TEMA OSCURO / CLARO
     ============================================================ */
  const THEME_STORAGE = "studnova:theme";

  function initTheme() {
    const saved = localStorage.getItem(THEME_STORAGE);
    const prefersLight = saved === "light";
    const prefersDark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (prefersDark) {
      document.documentElement.classList.add("dark-mode");
      updateThemeToggle();
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle("dark-mode");
    localStorage.setItem(THEME_STORAGE, isDark ? "dark" : "light");
    updateThemeToggle();
  }

  function updateThemeToggle() {
    const isDark = document.documentElement.classList.contains("dark-mode");
    const buttons = document.querySelectorAll(".theme-toggle");
    buttons.forEach((btn) => {
      btn.textContent = isDark ? "☀️" : "🌙";
    });
  }

  // Inicializar tema
  initTheme();

  // Event listeners para los botones de tema
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("theme-toggle")) {
      toggleTheme();
    }
  });

  /* ============================================================
     MENÚ MÓVIL
     ============================================================ */
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navCollapsible = document.getElementById("navCollapsible");

  function closeMobileMenu() {
    if (!navCollapsible || !hamburgerBtn) return;
    navCollapsible.classList.remove("is-open");
    hamburgerBtn.setAttribute("aria-expanded", "false");
  }

  function toggleMobileMenu() {
    if (!navCollapsible || !hamburgerBtn) return;
    const isOpen = navCollapsible.classList.toggle("is-open");
    hamburgerBtn.setAttribute("aria-expanded", String(isOpen));
  }

  if (hamburgerBtn && navCollapsible) {
    hamburgerBtn.addEventListener("click", toggleMobileMenu);

    // Cerrar al hacer click en un enlace o botón dentro del menú
    navCollapsible.addEventListener("click", (e) => {
      if (e.target.closest("a") || e.target.closest("button")) {
        closeMobileMenu();
      }
    });

    // Cerrar al hacer click fuera del menú
    document.addEventListener("click", (e) => {
      if (
        navCollapsible.classList.contains("is-open") &&
        !navCollapsible.contains(e.target) &&
        !hamburgerBtn.contains(e.target)
      ) {
        closeMobileMenu();
      }
    });

    // Cerrar con Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMobileMenu();
    });

    // Cerrar si la ventana vuelve a tamaño de escritorio
    window.addEventListener("resize", () => {
      if (window.innerWidth > 880) closeMobileMenu();
    });
  }

  /* ============================================================
     MODALES
     ============================================================ */
  const overlay = document.getElementById("modalOverlay");
  const modals = {
    login: document.getElementById("loginModal"),
    signup: document.getElementById("signupModal"),
  };
  let lastFocusedEl = null;

  function openModal(name) {
    const target = modals[name];
    if (!target) return;

    lastFocusedEl = document.activeElement;

    Object.values(modals).forEach((m) => {
      m.classList.remove("is-active");
      m.hidden = true;
    });
    target.hidden = false;
    // force reflow so the transition triggers
    void target.offsetWidth;
    target.classList.add("is-active");

    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";

    clearFormBanners();

    const firstField = target.querySelector("input");
    if (firstField) {
      setTimeout(() => firstField.focus(), 80);
    }
  }

  function closeModal() {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
    Object.values(modals).forEach((m) => m.classList.remove("is-active"));
    setTimeout(() => {
      Object.values(modals).forEach((m) => (m.hidden = true));
    }, 220);

    if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
      lastFocusedEl.focus();
    }
  }

  function clearFormBanners() {
    document.querySelectorAll(".form-banner").forEach((b) => {
      b.hidden = true;
      b.textContent = "";
      b.classList.remove("error", "success");
    });
  }

  // Abrir modal desde cualquier botón con data-open-modal
  document.querySelectorAll("[data-open-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openModal(btn.getAttribute("data-open-modal"));
    });
  });

  // Cerrar con la X
  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });

  // Cerrar al hacer click en el fondo (no dentro de la tarjeta)
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  // Cerrar con Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) {
      closeModal();
    }
  });

  // Mostrar / ocultar contraseña
  document.querySelectorAll("[data-toggle-pass]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.getAttribute("data-toggle-pass"));
      if (!input) return;
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      btn.textContent = isHidden ? "Ocultar" : "Ver";
    });
  });

  /* ============================================================
     TOASTS
     ============================================================ */
  const toastStack = document.getElementById("toastStack");

  function showToast(message, type) {
    const toast = document.createElement("div");
    toast.className = "toast " + (type === "error" ? "error" : "success");
    toast.textContent = message;
    toastStack.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("is-visible"));

    setTimeout(() => {
      toast.classList.remove("is-visible");
      setTimeout(() => toast.remove(), 250);
    }, 3600);
  }

  /* ============================================================
     ERRORES DE CAMPO
     ============================================================ */
  function setFieldError(inputId, message) {
    const input = document.getElementById(inputId);
    const errorEl = document.getElementById(inputId + "Error");
    if (!input || !errorEl) return;
    input.closest(".field").classList.add("has-error");
    errorEl.textContent = message;
  }

  function clearFieldError(inputId) {
    const input = document.getElementById(inputId);
    const errorEl = document.getElementById(inputId + "Error");
    if (!input || !errorEl) return;
    input.closest(".field").classList.remove("has-error");
    errorEl.textContent = "";
  }

  function clearAllFieldErrors(formEl) {
    formEl.querySelectorAll(".field").forEach((f) => f.classList.remove("has-error"));
    formEl.querySelectorAll(".field-error").forEach((e) => (e.textContent = ""));
  }

  function setFormBanner(bannerId, message, type) {
    const banner = document.getElementById(bannerId);
    if (!banner) return;
    banner.hidden = false;
    banner.textContent = message;
    banner.classList.remove("error", "success");
    banner.classList.add(type);
  }

  /* ---------- Limpiar errores mientras el usuario corrige ---------- */
  [
    "signupName",
    "signupEmail",
    "signupPassword",
    "signupPasswordConfirm",
    "loginEmail",
    "loginPassword",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", () => clearFieldError(id));
  });

  /* ============================================================
     FORMULARIO: CREAR CUENTA
     ============================================================ */
  const signupForm = document.getElementById("signupForm");
  const signupPasswordInput = document.getElementById("signupPassword");
  const strengthMeter = document.getElementById("strengthMeter");

  signupPasswordInput.addEventListener("input", () => {
    const score = passwordStrength(signupPasswordInput.value);
    strengthMeter.className = "strength-meter";
    if (signupPasswordInput.value.length === 0) return;
    if (score <= 1) strengthMeter.classList.add("s1");
    else if (score === 2) strengthMeter.classList.add("s2");
    else if (score === 3) strengthMeter.classList.add("s3");
    else strengthMeter.classList.add("s4");
  });

  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    clearAllFieldErrors(signupForm);
    clearFormBanners();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const password = document.getElementById("signupPassword").value;
    const passwordConfirm = document.getElementById("signupPasswordConfirm").value;

    let hasError = false;

    if (name.length < 2) {
      setFieldError("signupName", "Escribe tu nombre completo.");
      hasError = true;
    }

    if (!isValidEmail(email)) {
      setFieldError("signupEmail", "Ingresa un correo electrónico válido.");
      hasError = true;
    }

    if (password.length < 8) {
      setFieldError("signupPassword", "La contraseña debe tener al menos 8 caracteres.");
      hasError = true;
    }

    if (passwordConfirm !== password || passwordConfirm === "") {
      setFieldError("signupPasswordConfirm", "Las contraseñas no coinciden.");
      hasError = true;
    }

    if (hasError) return;

    const users = getUsers();
    const alreadyExists = users.some((u) => u.email === email);

    if (alreadyExists) {
      setFieldError("signupEmail", "Ya existe una cuenta con este correo.");
      setFormBanner("signupFormBanner", "Ese correo ya está registrado. Intenta iniciar sesión.", "error");
      return;
    }

    const newUser = {
      name,
      email,
      passwordHash: simpleHash(password),
      createdAt: Date.now(),
      plans: 0,
    };

    users.push(newUser);

    if (!saveUsers(users)) {
      setFormBanner("signupFormBanner", "No se pudo guardar tu cuenta. Intenta de nuevo.", "error");
      return;
    }

    setSession(email);
    signupForm.reset();
    strengthMeter.className = "strength-meter";

    closeModal();
    showToast("Cuenta creada. ¡Bienvenido a StudNova, " + name.split(" ")[0] + "!", "success");
    refreshAuthUI();
  });

  /* ============================================================
     FORMULARIO: INICIAR SESIÓN
     ============================================================ */
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    clearAllFieldErrors(loginForm);
    clearFormBanners();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    let hasError = false;

    if (!isValidEmail(email)) {
      setFieldError("loginEmail", "Ingresa un correo electrónico válido.");
      hasError = true;
    }

    if (password.length === 0) {
      setFieldError("loginPassword", "Ingresa tu contraseña.");
      hasError = true;
    }

    if (hasError) return;

    const users = getUsers();
    const user = users.find((u) => u.email === email);

    if (!user || user.passwordHash !== simpleHash(password)) {
      setFormBanner("loginFormBanner", "Correo o contraseña incorrectos.", "error");
      return;
    }

    setSession(email);
    loginForm.reset();

    closeModal();
    showToast("Sesión iniciada. Bienvenido, " + user.name.split(" ")[0] + ".", "success");
    refreshAuthUI();
  });

  /* ============================================================
     ESTADO DE SESIÓN EN LA UI
     ============================================================ */
  const navLoggedOut = document.getElementById("navCtaLoggedOut");
  const navLoggedIn = document.getElementById("navCtaLoggedIn");
  const userChipAvatar = document.getElementById("userChipAvatar");
  const userChipName = document.getElementById("userChipName");
  const logoutBtn = document.getElementById("logoutBtn");
  const dashboardBanner = document.getElementById("dashboardBanner");
  const dashboardGreeting = document.getElementById("dashboardGreeting");
  const dashboardSub = document.getElementById("dashboardSub");
  const statPlans = document.getElementById("statPlans");

  function refreshAuthUI() {

    const rawSession = localStorage.getItem("studnova:session");

    let session = null;

    try {
        session = rawSession ? JSON.parse(rawSession) : null;
    } catch (error) {
        session = null;
    }

    if (session && session.nombre) {

        navLoggedOut.hidden = true;
        navLoggedIn.hidden = false;
        dashboardBanner.hidden = false;

        const nombre = session.nombre;
        const firstName = nombre.split(" ")[0];

        userChipAvatar.textContent =
            nombre.charAt(0).toUpperCase();

        userChipName.textContent = firstName;

        dashboardGreeting.textContent =
            "Hola, " + firstName + " 👋";

        dashboardSub.textContent =
            "Tu cuenta está lista. En la versión completa, aquí verías tu plan de estudios generado por IA.";

    } else {

        navLoggedOut.hidden = false;
        navLoggedIn.hidden = true;
        dashboardBanner.hidden = true;

    }
}

  logoutBtn.addEventListener("click", () => {
    clearSession();
    refreshAuthUI();
    showToast("Cerraste sesión correctamente.", "success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- Inicializar al cargar la página ---------- */
  refreshAuthUI();



  const sesion = StudNovaSession.get();

const navLoggedOut = document.getElementById("navCtaLoggedOut");
const navLoggedIn = document.getElementById("navCtaLoggedIn");
const userChipName = document.getElementById("userChipName");
const userChipAvatar = document.getElementById("userChipAvatar");

if (sesion) {

    // Oculta el menú de iniciar sesión
    navLoggedOut.hidden = true;

    // Muestra el menú del usuario
    navLoggedIn.hidden = false;

    // Coloca el nombre del usuario
    userChipName.textContent = sesion.nombre;

    // Coloca la primera letra del nombre
    userChipAvatar.textContent =
        sesion.nombre.charAt(0).toUpperCase();

} else {

    // Si no hay sesión, muestra iniciar sesión
    navLoggedOut.hidden = false;
    navLoggedIn.hidden = true;

}
})();