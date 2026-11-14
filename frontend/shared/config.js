export const API_BASE = (window.location.port === "8000" || window.location.port === "")
    ? ""
    : "http://127.0.0.1:8000";

export const SESSION_KEY = "studnova:session";
export const CONSENT_VERSION = "2026-10-17";
export const CONSENT_KEY = "studnova:consentimiento";