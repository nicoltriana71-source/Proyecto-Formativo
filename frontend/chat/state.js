import { getUserId } from '../shared/session.js';

export const chatState = {
    history: [],
    uiMessages: [],
    currentPlan: null,
    attachedFile: null
};

export function saveChatState() {
    const id = getUserId();
    localStorage.setItem(`studnova_chat_historial_${id}`, JSON.stringify(chatState.history));
    localStorage.setItem(`studnova_chat_ui_${id}`, JSON.stringify(chatState.uiMessages));
    if (chatState.currentPlan) {
        localStorage.setItem(`studnova_plan_${id}`, JSON.stringify(chatState.currentPlan));
    }
}

export function loadChatState() {
    const id = getUserId();
    chatState.history = JSON.parse(localStorage.getItem(`studnova_chat_historial_${id}`) || "[]");
    chatState.uiMessages = JSON.parse(localStorage.getItem(`studnova_chat_ui_${id}`) || "[]");
    chatState.currentPlan = JSON.parse(localStorage.getItem(`studnova_plan_${id}`) || "null");
}

export function clearChatState() {
    const id = getUserId();
    localStorage.removeItem(`studnova_chat_historial_${id}`);
    localStorage.removeItem(`studnova_chat_ui_${id}`);
    localStorage.removeItem(`studnova_plan_${id}`);
    chatState.history = [];
    chatState.uiMessages = [];
    chatState.currentPlan = null;
    chatState.attachedFile = null;
}