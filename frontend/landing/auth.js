import { apiRequest } from '../shared/api.js';
import { saveSession, clearSession, getSession } from '../shared/session.js';
import { showToast } from '../shared/dom.js';

window.StudNovaSession = { get: getSession };

function refreshAuthUI() {
    const session = getSession();
    const navLoggedOut = document.getElementById("navCtaLoggedOut");
    const navLoggedIn = document.getElementById("navCtaLoggedIn");
    const userChipName = document.getElementById("userChipName");

    if (session?.nombre) {
        if (navLoggedOut) navLoggedOut.hidden = true;
        if (navLoggedIn) navLoggedIn.hidden = false;
        if (userChipName) userChipName.textContent = session.nombre.split(" ")[0];
    } else {
        if (navLoggedOut) navLoggedOut.hidden = false;
        if (navLoggedIn) navLoggedIn.hidden = true;
    }
}

document.getElementById("signupForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const password = document.getElementById("signupPassword").value;

    try {
        const usuario = await apiRequest("/usuario/registro", {
            method: "POST",
            body: JSON.stringify({ nombre: name, correo: email, contraseña: password })
        });
        saveSession(usuario);
        showToast(`Bienvenido, ${usuario.nombre.split(" ")[0]}!`, "success");
        refreshAuthUI();
        // Cerrar modal si existe
        document.getElementById("modalOverlay")?.classList.remove("is-open");
    } catch (error) {
        showToast(error.message, "error");
    }
});

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    try {
        const usuario = await apiRequest("/usuario/login", {
            method: "POST",
            body: JSON.stringify({ correo: email, contraseña: password })
        });
        saveSession(usuario);
        showToast(`Sesión iniciada. Hola, ${usuario.nombre.split(" ")[0]}.`, "success");
        refreshAuthUI();
        document.getElementById("modalOverlay")?.classList.remove("is-open");
    } catch (error) {
        showToast("Correo o contraseña incorrectos.", "error");
    }
});

document.getElementById("logoutBtn")?.addEventListener("click", () => {
    clearSession();
    refreshAuthUI();
    showToast("Sesión cerrada.", "success");
});

document.getElementById("openChatBtn")?.addEventListener("click", () => {
    if (!getSession()) {
        showToast("Debes iniciar sesión primero.", "error");
        return;
    }
    window.location.href = "/ia/interfaz.html";
});

// Init
refreshAuthUI();