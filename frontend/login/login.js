import { apiRequest } from '../shared/api.js';
import { saveSession } from '../shared/session.js';
import { CONSENT_VERSION } from '../shared/config.js';
import { saveConsent } from '../shared/consent.js';
import { mostrarFormulario, setMensaje, initConsentUI, initLinks } from './ui.js';

initConsentUI();
initLinks();

document.getElementById("formLogin")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMensaje("loginMensaje", "Iniciando sesión...");
    try {
        const data = await apiRequest("/usuario/login", {
            method: "POST",
            body: JSON.stringify({
                correo: document.getElementById("loginCorreo").value.trim().toLowerCase(),
                contraseña: document.getElementById("loginPassword").value
            })
        });
        saveSession(data);
        setMensaje("loginMensaje", `¡Bienvenido, ${data.nombre}!`, "success");
        setTimeout(() => window.location.href = "/ia/interfaz.html", 600);
    } catch (error) {
        setMensaje("loginMensaje", error.message, "error");
    }
});

document.getElementById("formRegister")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const casilla = document.getElementById("registerAcepto");
    if (!casilla?.checked) {
        document.getElementById("registerAceptaWrap")?.classList.add("con-error");
        setMensaje("registerMensaje", "Debes aceptar los Términos y la Política.", "error");
        return;
    }
    setMensaje("registerMensaje", "Creando cuenta...");
    try {
        const correo = document.getElementById("registerCorreo").value.trim().toLowerCase();
        await apiRequest("/usuario/registro", {
            method: "POST",
            body: JSON.stringify({
                nombre: document.getElementById("registerNombre").value.trim(),
                correo,
                contraseña: document.getElementById("registerPassword").value,
                acepto_terminos: true,
                version_politica: CONSENT_VERSION
            })
        });
        saveConsent();
        setMensaje("registerMensaje", "¡Cuenta creada!", "success");
        document.getElementById("loginCorreo").value = correo;
        setTimeout(() => mostrarFormulario("login"), 1000);
    } catch (error) {
        setMensaje("registerMensaje", error.message, "error");
    }
});