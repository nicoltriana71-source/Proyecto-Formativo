import { escapeHTML } from '../shared/dom.js';

const chatBox = document.getElementById('chat-box');

export function renderUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'mensaje';
    div.style.flexDirection = 'row-reverse';
    div.innerHTML = `
        <div class="avatar" style="background:#1e293b; display:flex; justify-content:center; align-items:center;">👩🏻‍💻</div>
        <div class="contenido" style="background:#1e293b;"><p>${escapeHTML(text)}</p></div>`;
    chatBox.appendChild(div);
}

export function renderLoading(id, text = "StudNova IA está respondiendo...") {
    const div = document.createElement('div');
    div.className = 'mensaje mensaje-carga';
    div.id = id;
    div.innerHTML = `
        <div class="avatar"><img src="avatar.png" alt="Avatar" style="width:100%; height:100%; object-fit:cover; border-radius:50%;"></div>
        <div class="contenido contenido-carga">
            <div class="indicador-escritura"><span></span><span></span><span></span></div>
            <p class="texto-carga">${text}</p>
        </div>`;
    chatBox.appendChild(div);
    return id;
}

export function removeElement(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

export function scrollToBottom() {
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
}