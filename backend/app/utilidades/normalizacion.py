import json
import re
import unicodedata


def normalizar_texto(texto: str) -> str:
    if not texto:
        return ""

    texto = texto.lower().strip()
    texto = unicodedata.normalize(
        "NFKD",
        texto
    ).encode("ASCII", "ignore").decode("utf-8")

    return texto


def extraer_palabras_clave(texto: str) -> set:
    t = normalizar_texto(texto)

    stopwords = {
        "hola", "buenas", "buenos", "dias", "tardes", "noches",
        "que", "tal", "como", "estas", "esta", "estoy", "estan",
        "estamos", "por", "favor", "quiero", "necesito", "gustaria",
        "aprender", "estudiar", "saber", "ensenar", "ensename",
        "crea", "crear", "creame", "generar", "generame", "haz",
        "hazme", "dame", "un", "una", "unos", "unas", "el", "la",
        "los", "las", "de", "del", "en", "para", "sobre", "con",
        "desde", "cero", "ed", "plan", "estudio", "estudios",
        "ruta", "aprendizaje", "curso", "tutorial", "guia", "temario",
        "semana", "semanas", "mes", "meses", "dia", "hora", "horas",
        "modulo", "modulos", "moudulo", "moudulos", "nivel",
        "basico", "intermedio", "avanzado", "principiante",
        "principiantes", "intensivo", "te", "me", "se", "nos",
        "le", "les", "lo", "va", "van", "vas", "voy", "fue",
        "era", "soy", "eres", "es", "somos", "son", "bien", "mal",
        "mas", "menos", "muy", "tan", "tanto", "hacer", "haces",
        "hace", "dice", "dices", "decir", "ver", "ves", "mira",
        "oye", "amigo", "amiga", "amor", "adios", "chao", "gracias",
        "denada", "ok", "okay", "vale", "si", "no", "cual",
        "quien", "donde", "cuando", "porque", "por que", "algo",
        "nada", "todo", "todos", "todas", "otro", "otra", "otros",
        "otras", "nuevo", "nueva", "nuevos", "nuevas", "cambiar",
        "cambio", "tema", "temas", "tiempo", "dividido", "detalles",
        "ejercicios", "practica", "practico", "practicos"
    }

    palabras = [
        p for p in re.findall(r"[a-z0-9+#]+", t)
        if not p.isdigit()
    ]

    tecnologias_cortas = {
        "c", "r", "js", "ai", "ui", "ux", "go", "db", "ml", "qa"
    }

    return {
        p for p in palabras
        if p not in stopwords
        and (len(p) > 2 or p in tecnologias_cortas)
    }


def normalizar_a_dict(obj):
    if isinstance(obj, dict):
        return obj

    if isinstance(obj, str):
        try:
            parsed = json.loads(obj)
            if isinstance(parsed, dict):
                return parsed
        except Exception:
            pass

        return {
            "titulo": str(obj),
            "modulos": []
        }

    return {}