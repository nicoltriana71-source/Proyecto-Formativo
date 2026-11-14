import { API_BASE } from './config.js';

export async function apiRequest(endpoint, options = {}) {
    const isFormData = options.body instanceof FormData;
    const headers = isFormData
        ? { ...(options.headers || {}) }
        : { "Content-Type": "application/json", ...(options.headers || {}) };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.detail || "Error en el servidor.");
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