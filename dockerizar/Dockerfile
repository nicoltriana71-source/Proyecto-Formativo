FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Instalar dependencias del sistema para PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar todo el cdigo del proyecto
COPY . .

# Exponer el puerto de FastAPI y las interfaces web
EXPOSE 8000

# Iniciar la aplicacin
# Iniciar la aplicación
CMD ["sh", "-c", "echo '========================================' && echo '🚀 Proyecto iniciado correctamente' && echo '🌐 http://localhost:8000/principal/interfaz/index.html' && echo '📚 API: http://localhost:8000/docs' && echo '========================================' && exec uvicorn principal:app --host 0.0.0.0 --port 8000 --reload"]
