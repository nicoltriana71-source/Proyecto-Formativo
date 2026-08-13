from app.gemini import generar_codigo_ia

print("⏳ Enviando solicitud a Gemini y procesando archivos...")

# Le pedimos a la IA que cree una tarjeta interactiva de prueba
resultado = generar_codigo_ia(
    prompt_usuario="Crea una tarjeta de perfil de estudiante moderna con modo oscuro/claro y un botón interactivo",
    nombre_archivo="prueba_estudiante"
)

print("\n✅ ¡Éxito! Archivos generados y separados:")
for tipo, ruta in resultado["rutas"].items():
    print(f" - {tipo.upper()}: {ruta}")