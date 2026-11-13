import { hasConsent } from '../shared/consent.js';

export function mostrarFormulario(id) {
    document.querySelectorAll(".form-container").forEach(f => f.classList.remove("active"));
    const target = document.getElementById(id);
    if (target) target.classList.add("active");
}

export function setMensaje(id, texto, tipo = "info") {
    const el = document.getElementById(id);
    if (!el) return;

    el.hidden = false;
    el.textContent = texto;
    el.className = `form-mensaje ${tipo}`;

    if (tipo === "error") {
        el.style.color = "#E9938A";
    } else if (tipo === "success") {
        el.style.color = "lightgreen";
    } else {
        el.style.color = "#93c5fd";
    }
}

export function initConsentUI() {
    // si acepto
    if (hasConsent()) {
        document.getElementById("googleAceptaWrap")?.setAttribute("hidden", "");
    }


    ["googleAcepto", "registerAcepto"].forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.addEventListener("change", (e) => {
                e.target.closest(".aceptar")?.classList.remove("con-error");
            });
        }
    });
}

export function initLinks() {
    document.querySelectorAll("[data-mostrar]").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            mostrarFormulario(link.dataset.mostrar);
        });
    });
}