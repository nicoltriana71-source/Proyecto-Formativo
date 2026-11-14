from backend.app.utilidades.extractor_texto import extraer_texto_de_archivo


async def procesar_archivo_adjunto(archivo) -> tuple[str, str]:
    """Retorna una tupla (texto_extraido, nombre_archivo)."""
    texto_extraido = ""
    nombre_doc = ""

    if archivo and archivo.filename:
        nombre_doc = archivo.filename
        contenido_bytes = await archivo.read()

        if contenido_bytes:
            texto_extraido = extraer_texto_de_archivo(contenido_bytes, nombre_doc)

    return texto_extraido, nombre_doc