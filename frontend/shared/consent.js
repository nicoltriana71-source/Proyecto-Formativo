import { CONSENT_KEY, CONSENT_VERSION } from './config.js';

export function hasConsent() {
    try {
        const c = JSON.parse(localStorage.getItem(CONSENT_KEY) || "null");
        return Boolean(c && c.version === CONSENT_VERSION);
    } catch { return false; }
}

export function saveConsent() {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
        version: CONSENT_VERSION,
        fecha: new Date().toISOString()
    }));
}

export function requireConsent(checkboxId, wrapperId) {
    if (hasConsent()) return true;
    const casilla = document.getElementById(checkboxId);
    if (casilla?.checked) return true;
    document.getElementById(wrapperId)?.classList.add("con-error");
    return false;
}