import {
    ACCESS_TOKEN_KEY,
    CONSENT_KEY,
    REFRESH_TOKEN_KEY,
    SESSION_KEY
} from './config.js';

export function saveSession(usuario) {
    if (usuario.access_token) {
        localStorage.setItem(ACCESS_TOKEN_KEY, usuario.access_token);
    }
    if (usuario.refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, usuario.refresh_token);
    }

    const session = {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol || "ESTUDIANTE",
        since: Date.now()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem("user", JSON.stringify({
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: session.rol
    }));
    localStorage.setItem("id_usuario", usuario.id_usuario);
    localStorage.setItem("userEmail", usuario.correo);
    localStorage.setItem("userName", usuario.nombre);
    localStorage.setItem("isLoggedIn", "true");
}

export function getSession() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken, refreshToken) {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearSession() {
    // Se conserva el consentimiento (registro legal) al cerrar sesión.
    const consentimiento = localStorage.getItem(CONSENT_KEY);
    localStorage.clear();
    sessionStorage.clear();
    if (consentimiento) {
        localStorage.setItem(CONSENT_KEY, consentimiento);
    }
}

export function getUserId() {
    const session = getSession();
    if (session?.id_usuario) return parseInt(session.id_usuario);

    try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const id = JSON.parse(userStr).id_usuario;
            return id ? parseInt(id) : null;
        }
    } catch {}

    return null;
}
