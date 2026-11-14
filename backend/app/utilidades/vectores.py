#Similitud coseno y cálculos matemáticos
import math


def calcular_similitud_coseno(vec_a: list, vec_b: list) -> float:
    """Calcula la similitud de coseno entre dos vectores numéricos (0.0 a 1.0)."""
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot_product / (norm_a * norm_b)