export const API_BASE = (window.location.port === "8000" || window.location.port === "")
    ? ""
    : "http://127.0.0.1:8000";

export const SESSION_KEY = "studnova:session";
export const ACCESS_TOKEN_KEY = "studnova:access_token";
export const REFRESH_TOKEN_KEY = "studnova:refresh_token";
export const CONSENT_VERSION = "2026-10-17";
export const CONSENT_KEY = "studnova:consentimiento";
