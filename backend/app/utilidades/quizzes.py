#Aleatorización de preguntas (A, B, C, D)
import random


def aleatorizar_quizzes_plan(datos: dict) -> dict:
    """
    Asegura que las opciones de los mini quizzes se barajen aleatoriamente
    y se recalcule 'indice_correcto', garantizando que la respuesta correcta
    no sea siempre la 'A' (índice 0), sino que varíe entre A, B, C y D.
    """
    if not isinstance(datos, dict):
        return datos

    plan = datos.get("plan") if isinstance(datos.get("plan"), dict) else datos
    if not isinstance(plan, dict):
        return datos

    modulos = plan.get("modulos")
    if not isinstance(modulos, list):
        return datos

    for mod in modulos:
        if not isinstance(mod, dict):
            continue
        quizzes = mod.get("mini_quizzes")
        if not isinstance(quizzes, list):
            quiz_unico = mod.get("quiz")
            if isinstance(quiz_unico, dict):
                quizzes = [quiz_unico]
            else:
                continue

        for q in quizzes:
            if not isinstance(q, dict):
                continue
            opciones = q.get("opciones")
            if isinstance(opciones, list) and len(opciones) > 1:
                idx_actual = q.get("indice_correcto", 0)
                if not isinstance(idx_actual, int) or idx_actual < 0 or idx_actual >= len(opciones):
                    idx_actual = 0
                
                resp_correcta = opciones[idx_actual]
                opciones_con_flag = [(opc, i == idx_actual) for i, opc in enumerate(opciones)]
                random.shuffle(opciones_con_flag)
                
                q["opciones"] = [opc for opc, flag in opciones_con_flag]
                q["indice_correcto"] = next(i for i, (opc, flag) in enumerate(opciones_con_flag) if flag)

    return datos