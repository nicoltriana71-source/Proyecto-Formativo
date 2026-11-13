import { apiRequest } from '../shared/api.js';
import { saveSession } from '../shared/session.js';
import { CONSENT_VERSION } from '../shared/config.js';
import { saveConsent, requireConsent } from '../shared/consent.js';
import { setMensaje } from './ui.js';

const CLIENT_ID = "625376533141-3vug0hb9n3u6kqqk7gmi7g7cf1nfo6ql.apps.googleusercontent.com";
let tokenClient;

async function handleUser(user) {
    setMensaje("loginMensaje", "Sincronizando cuenta...");
    try {
        const data = await apiRequest("/usuario/google", {
            method: "POST",
            body: JSON.stringify({
                nombre: user.name,
                correo: user.email,
                google_id: user.sub,
                foto: user.picture,
                acepto_terminos: true,
                version_politica: CONSENT_VERSION
            })
        });
        saveSession(data);
        saveConsent();
        localStorage.setItem("userPhoto", user.picture || "");
        localStorage.setItem("loginMethod", "google");
        setMensaje("loginMensaje", `¡Bienvenido, ${data.nombre}!`, "success");
        setTimeout(() => window.location.href = "/chat/interfaz.html", 600);
    } catch (err) {
        setMensaje("loginMensaje", `Error: ${err.message}`, "error");
    }
}

function abrirGoogle() {
    if (!requireConsent("googleAcepto", "googleAceptaWrap")) {
        setMensaje("loginMensaje", "Debes aceptar los Términos para continuar con Google.", "error");
        return;
    }
    if (!google?.accounts?.oauth2) {
        alert("Google aún se está cargando. Espera unos segundos.");
        return;
    }
    if (!tokenClient) {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: "email profile openid",
            callback: async (resp) => {
                if (resp.error) return;
                try {
                    const r = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                        headers: { Authorization: `Bearer ${resp.access_token}` }
                    });
                    handleUser(await r.json());
                } catch (e) { console.error(e); }
            }
        });
    }
    tokenClient.requestAccessToken({ prompt: "select_account" });
}

document.getElementById("btnGoogle")?.addEventListener("click", (e) => {
    e.preventDefault();
    abrirGoogle();
});