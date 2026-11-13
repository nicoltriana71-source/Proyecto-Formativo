import { SESSION_KEY } from './config.js';

export function saveSession(usuario) {
    const session = {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        since: Date.now()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem("user", JSON.stringify(usuario));
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

export function clearSession() {
    localStorage.clear();
    sessionStorage.clear();
}

export function getUserId() {
    const session = getSession();
    if (session?.id_usuario) return parseInt(session.id_usuario);

    try {
        const userStr = localStorage.getItem("user");
        if (userStr) return JSON.parse(userStr).id_usuario || 1;
    } catch {}
    return 1;
}