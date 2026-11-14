# StudNova — Aplicativo web de Aprendizaje Autónomo Asistido por IA

> **StudNova** es un aplicativo web inteligente de gestión de aprendizaje autónomo diseñado para transformar la educación autodidacta mediante el uso de Inteligencia Artificial. Estructura dinámicamente planes de estudio personalizados con explicaciones profundas, prácticas guiadas, mini-quizzes de comprobación y tutoría conversacional en tiempo real, integrando un módulo diferenciador de **control de fatiga cognitiva**.

## Características principales

- Generación de planes de estudio personalizados con IA.
- Tutor conversacional con memoria del historial.
- Módulos, temas, teoría, ejemplos y mini-quizzes.
- Caché semántico para reutilizar planes existentes.
- Carga de documentos para generar planes a partir de un temario.
- Control de fatiga cognitiva y seguimiento de progreso.
- Autenticación de usuarios y persistencia en PostgreSQL.
- Migraciones de base de datos versionadas con Alembic.

## Tecnologías

| Capa | Tecnologías |
| :--- | :--- |
| **Backend** | Python 3.11, FastAPI, SQLModel / SQLAlchemy, Pydantic, Uvicorn |
| **Base de Datos** | PostgreSQL 16 + Alembic (migraciones versionadas) |
| **Inteligencia Artificial** | Google GenAI SDK (Gemini Flash-Lite, Embeddings vectoriales) y Groq como respaldo |
| **Frontend** | HTML5, CSS3 moderno, JavaScript ES6+ |
| **DevOps / Despliegue** | Docker, Docker Compose |

![Version](https://img.shields.io/badge/Versi%C3%B3n-1.0.0-blue)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-IA%20Generativa-4285F4?logo=google&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)

## Requisitos previos

### Opción recomendada: Docker

- Git.
- Docker Engine o Docker Desktop.
- Docker Compose v2.24 o superior.
- Una API key de Gemini.
- Opcional: una API key de Groq para el respaldo de IA.

Verifica las versiones instaladas:

```bash
git --version
docker --version
docker compose version
```

### Opción sin Docker

- Python 3.11.
- PostgreSQL 16.
- Git.
- Las dependencias de `backend/requirements.txt`.

## 1. Clonar el repositorio

```bash
git clone https://github.com/nicoltriana71-source/Proyecto-Formativo.git
cd Proyecto-Formativo
```

Si vas a trabajar con la versión del refactor actual:

```bash
git checkout refactor
```

## 2. Crear el archivo `.env`

Crea un archivo llamado `.env` en la **raíz del proyecto**, al mismo nivel de `docker-compose.yml`, `principal.py` y `base_datos.py`.

Contenido mínimo:

```env
GEMINI_API_KEY=tu_api_key_de_gemini
GROQ_API_KEY=tu_api_key_de_groq
DATABASE_URL=postgresql://postgres:1234@localhost:5433/studnova
SQL_ECHO=false
```

Notas importantes:

- No agregues espacios alrededor del signo `=`.
- No subas el archivo `.env` al repositorio. Ya está incluido en `.gitignore`.
- `GEMINI_API_KEY` es obligatoria para la generación principal.
- `GROQ_API_KEY` es opcional, pero se recomienda para tener respaldo si Gemini falla.
- `SQL_ECHO=true` muestra las consultas SQL en la consola; déjalo en `false` para uso normal.
- Docker Compose define internamente `DATABASE_URL=postgresql://postgres:1234@db:5432/studnova`; el valor de `.env` se usa cuando ejecutas la aplicación fuera de Docker.

### Dónde obtener las API keys

- Gemini: https://aistudio.google.com/app/apikey
- Groq: https://console.groq.com/keys

## 3. Levantar el proyecto con Docker

Desde la raíz del proyecto:

```bash
docker compose up --build
```

Este comando:

1. Construye la imagen del backend.
2. Levanta PostgreSQL 16.
3. Espera a que la base de datos esté saludable.
4. Ejecuta `backend/scripts/migrate.py`, que aplica las migraciones de Alembic.
5. Inicia Uvicorn en el puerto `8000`.

Si prefieres dejarlo corriendo en segundo plano:

```bash
docker compose up -d --build
```

Para ver los logs:

```bash
docker compose logs -f web
```

Para detener los contenedores:

```bash
docker compose down
```

Para detenerlos y además borrar la base de datos:

```bash
docker compose down -v
```

> Advertencia: `docker compose down -v` elimina el volumen `studnova_pgdata` y, por tanto, todos los datos guardados.

## 4. Abrir la aplicación

Con los contenedores levantados:

| Recurso | URL |
| :--- | :--- |
| Landing page | http://localhost:8000/landing/index.html |
| Login / Registro | http://localhost:8000/login |
| Interfaz del chat IA | http://localhost:8000/ia/interfaz.html |
| Documentación de la API | http://localhost:8000/docs |
| Estado general de la API | http://localhost:8000/ |

Flujo recomendado:

1. Abre `/login` y registra un usuario.
2. Inicia sesión.
3. Entra a la interfaz del chat IA.
4. Solicita un plan de estudio indicando tema, duración y cantidad de módulos.

> Los endpoints de IA requieren un `id_usuario` existente. Registra un usuario antes de probar `/api/ia/generar`.

## 5. Base de datos

PostgreSQL se ejecuta en el contenedor `studnova_db`.

| Dato | Valor |
| :--- | :--- |
| Host desde tu máquina | `localhost` |
| Puerto desde tu máquina | `5433` |
| Host dentro de Docker | `db` |
| Puerto dentro de Docker | `5432` |
| Usuario | `postgres` |
| Contraseña | `1234` |
| Base de datos | `studnova` |

Para entrar a la consola de PostgreSQL:

```bash
docker compose exec db psql -U postgres -d studnova
```

Para ver los contenedores y su estado:

```bash
docker compose ps
```

## 6. Migraciones con Alembic

La configuración está en `backend/alembic.ini` y las migraciones en `backend/migrations/versions/`.

El contenedor aplica las migraciones automáticamente al iniciar. También puedes ejecutarlas manualmente:

```bash
docker compose exec web python backend/scripts/migrate.py
```

O directamente con Alembic:

```bash
docker compose exec web alembic -c backend/alembic.ini upgrade head
```

Para crear una nueva migración después de cambiar los modelos:

```bash
docker compose exec web alembic -c backend/alembic.ini revision --autogenerate -m "descripcion_del_cambio"
```

Revisa siempre el archivo generado antes de aplicarlo.

Si ya tienes una base de datos creada con el esquema anterior y sin historial de Alembic, `backend/scripts/migrate.py` la marca automáticamente como baseline antes de aplicar las migraciones pendientes.

## 7. Ejecutar sin Docker

Esta opción es útil si quieres correr el backend directamente con Python.

### 7.1. Crear y activar el entorno virtual

En Linux o macOS:

```bash
python3.11 -m venv .venv
source .venv/bin/activate
```

En Windows con PowerShell:

```powershell
py -3.11 -m venv .venv
.venv\Scripts\Activate.ps1
```

En Windows con CMD:

```bat
py -3.11 -m venv .venv
.venv\Scripts\activate.bat
```

### 7.2. Instalar dependencias

```bash
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
```

### 7.3. Tener PostgreSQL disponible

Puedes usar la base de datos de Docker:

```bash
docker compose up -d db
```

En ese caso, el archivo `.env` debe apuntar al puerto expuesto por Docker:

```env
DATABASE_URL=postgresql://postgres:1234@localhost:5433/studnova
```

Si usas un PostgreSQL instalado directamente en tu máquina, crea la base de datos `studnova` y ajusta el puerto, usuario y contraseña en `DATABASE_URL`.

### 7.4. Aplicar migraciones

```bash
python backend/scripts/migrate.py
```

### 7.5. Iniciar el servidor

```bash
uvicorn principal:app --reload --host 0.0.0.0 --port 8000
```

La aplicación quedará disponible en:

- http://localhost:8000/
- http://localhost:8000/docs
- http://localhost:8000/landing/index.html

## 8. Estructura del proyecto

```text
Proyecto-Formativo/
├── backend/
│   ├── alembic.ini
│   ├── Dockerfile
│   ├── migrations/
│   ├── scripts/
│   │   └── migrate.py
│   ├── requirements.txt
│   └── app/
│       ├── esquemas/
│       ├── modelos/
│       ├── repositories/
│       ├── rutas/
│       ├── services/
│       └── utilidades/
├── frontend/
│   ├── chat/
│   ├── landing/
│   ├── legal/
│   ├── login/
│   ├── plan/
│   └── shared/
├── base_datos.py
├── docker-compose.yml
├── principal.py
└── .env
```

La IA está organizada en capas:

- `backend/app/rutas/ia.py`: define los endpoints.
- `backend/app/services/ia.py`: orquesta la generación, caché y guardado.
- `backend/app/services/gemini.py`: conexión con Gemini y Groq.
- `backend/app/services/ia_generacion.py`: preparación de la generación.
- `backend/app/services/ia_cache.py`: búsqueda de planes existentes.
- `backend/app/services/ia_almacenamiento.py`: persistencia de planes, módulos y temas.
- `backend/app/services/ia_archivos.py`: procesamiento de documentos.
- `backend/app/repositories/ia.py`: acceso a datos.
- `backend/app/utilidades/`: normalización, quizzes, vectores y extracción de texto.

## 9. Endpoints principales

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/` | Estado general de la API |
| `GET` | `/docs` | Documentación interactiva |
| `POST` | `/usuario/registro` | Registrar usuario |
| `POST` | `/usuario/login` | Iniciar sesión |
| `POST` | `/api/ia/generar` | Generar plan de estudio |
| `POST` | `/api/ia/generar-con-archivo` | Generar plan desde un documento |
| `POST` | `/api/ia/aceptar-sugerencia` | Aceptar un plan sugerido existente |

## 10. Archivos admitidos para generar planes

La carga de documentos admite:

- PDF con texto digital.
- PDF escaneado, si el OCR está disponible.
- TXT, MD y CSV.
- PNG, JPG, JPEG y WEBP, si el OCR está disponible.

El OCR de imágenes y PDF escaneados requiere **Tesseract** instalado en el entorno donde corre la aplicación. En Docker, Tesseract debe estar dentro de la imagen; si no lo necesitas, puedes usar PDF con texto digital y archivos de texto sin problema.

## 11. Comandos útiles

```bash
# Levantar todo en segundo plano
docker compose up -d --build

# Ver logs del backend
docker compose logs -f web

# Reiniciar solo la aplicación
docker compose restart web

# Detener todo
docker compose down

# Reconstruir después de cambiar dependencias
docker compose up -d --build

# Ver el estado de los contenedores
docker compose ps

# Aplicar migraciones manualmente
docker compose exec web python backend/scripts/migrate.py

# Entrar a PostgreSQL
docker compose exec db psql -U postgres -d studnova
```

## 12. Actualizar el proyecto

```bash
git pull
docker compose up -d --build
```

Si cambió `backend/requirements.txt`, reconstruye la imagen. Si cambió el esquema de la base de datos, las migraciones se aplican automáticamente al iniciar el contenedor.

## 13. Solución de problemas

### `No se encontró GEMINI_API_KEY`

- Verifica que `.env` exista en la raíz del proyecto.
- Revisa que la variable se llame exactamente `GEMINI_API_KEY`.
- No uses espacios alrededor de `=`.
- Reinicia los contenedores:

```bash
docker compose up -d --build
```

### `port is already allocated`

Los puertos `8000` o `5433` están ocupados. Cambia los puertos en `docker-compose.yml`, por ejemplo:

```yaml
ports:
  - "8001:8000"
```

y para la base de datos:

```yaml
ports:
  - "5434:5432"
```

### La base de datos no responde

```bash
docker compose ps
docker compose logs db
```

Espera a que el contenedor aparezca como `healthy`. Si el problema continúa, reinicia:

```bash
docker compose restart db
```

### `relation ... does not exist`

Las migraciones no se aplicaron. Ejecuta:

```bash
docker compose exec web python backend/scripts/migrate.py
```

Si el problema persiste, reconstruye:

```bash
docker compose up -d --build
```

### Quiero empezar desde cero

```bash
docker compose down -v
docker compose up -d --build
```

Esto elimina todos los datos de PostgreSQL.

### Los cambios de código no se reflejan

El contenedor monta `backend/`, `frontend/`, `principal.py` y `base_datos.py` como volúmenes y Uvicorn corre con `--reload`. Si cambias dependencias o el `Dockerfile`, reconstruye:

```bash
docker compose up -d --build
```

## Equipo de Desarrollo

- Breiner Stanly Muñoz Martínez — **FullStack**
- Maira Daniela Ramirez Anzola — **FullStack**
- Nicol Hasblady Triana Rodríguez — **FullStack**
- Laura Isabella Tavera Contreras — **FullStack**
- Adrián Felipe Palacios Martínez — **FullStack**
