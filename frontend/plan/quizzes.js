import { completarModulo } from './progreso.js';

export function verificarRespuesta(boton, indiceSeleccionado) {
    const contenedorOpciones = boton.parentElement;
    const indiceCorrecto = parseInt(contenedorOpciones.getAttribute('data-correcta'));
    const botones = contenedorOpciones.querySelectorAll('button');
    const feedback = contenedorOpciones.nextElementSibling;

    botones.forEach(btn => btn.disabled = true);

    if (indiceSeleccionado === indiceCorrecto) {
        boton.classList.add('correcto');
        feedback.innerHTML = '<span style="color: #34d399;">✅ ¡Correcto! Módulo completado automáticamente.</span>';

        const params = new URLSearchParams(window.location.search);
        const planId = params.get('id') || 'actual';
        completarModulo(boton.closest('.modulo-contenido').id, planId);
    } else {
        boton.classList.add('incorrecto');
        if (botones[indiceCorrecto]) botones[indiceCorrecto].classList.add('correcto');
        feedback.innerHTML = '<span style="color: #f87171;">❌ Respuesta incorrecta. Revisa la opción resaltada en verde.</span>';
    }
}