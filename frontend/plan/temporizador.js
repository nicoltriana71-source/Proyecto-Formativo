import { getUserId } from '../shared/session.js';
import { apiRequest } from '../shared/api.js';

let tiempoSegundos = 25 * 60;
let intervalo = null;
let enPausa = true;
let timerIniciadoPreviamente = false;

export function autoIniciarTimer() {
    if (!timerIniciadoPreviamente && enPausa) {
        timerIniciadoPreviamente = true;
        alternarTimer();
        const estado = document.getElementById('estado-fatiga');
        if (estado) estado.innerText = "⚡ Sesión iniciada automáticamente por interacción. ¡Enfócate!";
    }
}

export function alternarTimer() {
    const btn = document.getElementById('btn-timer');
    const estado = document.getElementById('estado-fatiga');
    const params = new URLSearchParams(window.location.search);
    const idPlan = params.get('id');
    const idUsuario = getUserId();

    if (enPausa) {
        enPausa = false;
        if (btn) btn.innerText = "Pausar";
        if (estado) estado.innerText = "Sesión activa de enfoque. ¡Concéntrate!";

        intervalo = setInterval(() => {
            if (tiempoSegundos > 0) {
                tiempoSegundos--;
                actualizarDisplayTimer();
            } else {
                clearInterval(intervalo);
                alert("🔔 ¡Sesión completada! Toma una pausa activa de 5 minutos.");
                tiempoSegundos = 5 * 60;
                enPausa = true;
                if (btn) btn.innerText = "Iniciar Descanso";
                actualizarDisplayTimer();

                if (idUsuario && idPlan) {
                    apiRequest('/sesion-estudio/', {
                        method: 'POST',
                        body: JSON.stringify({ id_usuario: idUsuario, id_plan: parseInt(idPlan), id_modulo: 1, id_tema: 1, duracion_minutos: 25, completada: true })
                    }).catch(console.warn);

                    apiRequest('/control-fatiga/', {
                        method: 'POST',
                        body: JSON.stringify({ id_usuario: idUsuario, id_plan: parseInt(idPlan), nivel_fatiga: 2, observacion: "Pausa activa recomendada" })
                    }).catch(console.warn);
                }
            }
        }, 1000);
    } else {
        enPausa = true;
        clearInterval(intervalo);
        if (btn) btn.innerText = "Continuar";
        if (estado) estado.innerText = "Sesión en pausa.";
    }
}

export function actualizarDisplayTimer() {
    const minutos = Math.floor(tiempoSegundos / 60);
    const segundos = tiempoSegundos % 60;
    const el = document.getElementById('temporizador');
    if (el) el.innerText = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
}