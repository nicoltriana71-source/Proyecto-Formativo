import { apiRequest } from '../shared/api.js';
import { saveSession } from '../shared/session.js';
import { saveConsent, requireConsent } from '../shared/consent.js';
import { setMensaje } from './ui.js';

const CLIENT_ID = "625376533141-3vug0hb9n3u6kqqk7gmi7g7cf1nfo6ql.apps.googleusercontent.com";
let tokenClient;

const ERRORES_GOOGLE = {
    access_denied: "Acceso cancelado o cuenta no autorizada. Si la app está en modo 'Prueba', agrega tu cuenta como usuario de prueba en Google Cloud.",
    origin_mismatch: "Este origen no está autorizado en Google Cloud. Agrega http://localhost:8000 en 'Orígenes JavaScript autorizados' del Client ID.",
    invalid_client: "El Client ID no es válido o pertenece a otro proyecto de Google Cloud.",
    popup_failed_to_open: "El navegador bloqueó la ventana de Google. Permite las ventanas emergentes e inténtalo de nuevo.",
    popup_closed: "Cerraste la ventana de Google antes de terminar."
};

function mensajeErrorGoogle(codigo) {
    return ERRORES_GOOGLE[codigo]
        || `No se pudo iniciar sesión con Google (${codigo || "error desconocido"}).`;
}

async function handleToken(accessToken) {
    setMensaje("loginMensaje", "Sincronizando cuenta...");
    try {
        // El backend verifica el token contra Google; el frontend no envía datos de perfil.
        const data = await apiRequest("/usuario/google", {
            method: "POST",
            body: JSON.stringify({ access_token: accessToken })
        });
        saveSession(data);
        saveConsent();
        setMensaje("loginMensaje", `¡Bienvenido, ${data.nombre}!`, "success");
        setTimeout(() => window.location.href = "/ia/interfaz.html", 600);
    } catch (err) {
        setMensaje("loginMensaje", `Error: ${err.message}`, "error");
    }
}

function abrirGoogle() {
    if (!requireConsent("googleAcepto", "googleAceptaWrap")) {
        setMensaje("loginMensaje", "Debes aceptar los Términos para continuar con Google.", "error");
        return;
    }
    if (!window.google?.accounts?.oauth2) {
        setMensaje("loginMensaje", "Google aún se está cargando. Espera unos segundos e inténtalo de nuevo.", "error");
        return;
    }
    if (!tokenClient) {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: "email profile openid",
            callback: (resp) => {
                if (resp.error) {
                    setMensaje("loginMensaje", mensajeErrorGoogle(resp.error), "error");
                    return;
                }
                handleToken(resp.access_token);
            },
            error_callback: (err) => {
                setMensaje("loginMensaje", mensajeErrorGoogle(err?.type), "error");
            }
        });
    }

    try {
        tokenClient.requestAccessToken({ prompt: "select_account" });
    } catch (err) {
        setMensaje("loginMensaje", mensajeErrorGoogle(err?.type || err?.message), "error");
    }
}

document.getElementById("btnGoogle")?.addEventListener("click", (e) => {
    e.preventDefault();
    abrirGoogle();
});
