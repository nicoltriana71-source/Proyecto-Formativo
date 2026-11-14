import { ACCESS_TOKEN_KEY, API_BASE, REFRESH_TOKEN_KEY } from './config.js';
import { clearSession, getAccessToken, getRefreshToken, setTokens } from './session.js';

const RUTAS_SIN_REFRESH = [
    "/usuario/login",
    "/usuario/registro",
    "/usuario/refresh",
    "/usuario/google"
];

let refreshEnCurso = null;

function mensajeDeError(data) {
    if (!data) return "Error en el servidor.";
    if (Array.isArray(data.detail)) {
        return data.detail.map(item => item.msg || String(item)).join(" ");
    }
    return data.detail || "Error en el servidor.";
}

export function requireSession() {
    if (!getAccessToken()) {
        window.location.replace("/login");
        return false;
    }
    return true;
}

async function refrescarToken() {
    if (refreshEnCurso) return refreshEnCurso;

    refreshEnCurso = (async () => {
        const refresh = getRefreshToken();
        if (!refresh) return null;

        const respuesta = await fetch(`${API_BASE}/usuario/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refresh })
        });

        if (!respuesta.ok) {
            clearSession();
            return null;
        }

        const datos = await respuesta.json();
        setTokens(datos.access_token, datos.refresh_token);
        return datos.access_token;
    })().finally(() => {
        refreshEnCurso = null;
    });

    return refreshEnCurso;
}

export async function apiRequest(endpoint, options = {}, reintentar = true) {
    const isFormData = options.body instanceof FormData;
    const token = getAccessToken();

    const headers = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });

        const esRutaSinRefresh = RUTAS_SIN_REFRESH.some(ruta => endpoint.startsWith(ruta));

        if (response.status === 401 && reintentar && !esRutaSinRefresh) {
            const tokenNuevo = await refrescarToken();
            if (tokenNuevo) {
                return apiRequest(endpoint, options, false);
            }
            clearSession();
            if (!window.location.pathname.startsWith("/login")) {
                window.location.replace("/login");
            }
            throw new Error("Sesión expirada. Inicia sesión de nuevo.");
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(mensajeDeError(data));
        }

        return data;
    } catch (error) {
        console.error("API Error:", error);
        if (error instanceof TypeError) {
            throw new Error("No se pudo conectar con el servidor backend.");
        }
        throw error;
    }
}

export async function cerrarSesionBackend() {
    const refresh = getRefreshToken();

    if (refresh) {
        try {
            await apiRequest(
                "/usuario/logout",
                {
                    method: "POST",
                    body: JSON.stringify({ refresh_token: refresh })
                },
                false
            );
        } catch {
            // Aunque el backend no responda, se limpia la sesión local.
        }
    }

    clearSession();
}

export { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY };
