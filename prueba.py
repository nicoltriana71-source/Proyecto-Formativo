# En prueba.py
from app.gemini import client

print("🔍 Modelos habilitados en tu cuenta de pago:")
for modelo in client.models.list():
    if "generateContent" in getattr(modelo, "supported_generation_methods", []) or "generateContent" in getattr(modelo, "supported_actions", []):
        print(f" -> {modelo.name}")