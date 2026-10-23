# StudNova — Aplicativo web de Aprendizaje Autónomo Asistido por IA

> **StudNova** es un aplicativo web inteligente de gestión de aprendizaje autónomo diseñado para transformar la educación autodidacta mediante el uso de Inteligencia Artificial. Estructura dinámicamente planes de estudio personalizados con explicaciones profundas, prácticas guiadas, mini-quizzes de comprobación y tutoría conversacional en tiempo real, integrando un módulo diferenciador de **control de fatiga cognitiva**.

## Tecnologías
| Capa | Tecnologías |
| :--- | :--- |
| **Backend** | Python 3.11, FastAPI, SQLModel / SQLAlchemy, Pydantic, Uvicorn |
| **Base de Datos** | PostgreSQL 16 (Auto-migraciones y soporte relacional) |
| **Inteligencia Artificial** | Google GenAI SDK (Gemini Flash-Lite, Embeddings vectoriales) |
| **Frontend** | HTML5, CSS3 moderno (Dark mode, componentes interactivos), JavaScript ES6+ |
| **DevOps / Despliegue** | Docker, Docker Compose |

![Version](https://img.shields.io/badge/Versi%C3%B3n-1.0.0-blue)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-IA%20Generativa-4285F4?logo=google&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)

## Levantar el sistema 
1. CONFIGURAR VARIABLES DE ENTORNO. Crear el archivo .env con la siguiente estructura 
GEMINI_API_KEY=poner_la_api_key
DATABASE_URL=postgresql://postgres:LA_CLAVE@localhost:5432/studnova
GROQ_API_KEY=poner_la_api_key

2. LEVANTAR EL DOCKER COMPOSE. con el siguiente codigo 
docker compose -f dockerizar/docker-compose.yml up --build

## Equipo de Desarrollo 
Breiner Stanly Muñoz Martínez **FullStack**
Maira Daniela Ramirez Anzola **FullStack**
Nicol Hasblady Triana Rodríguez **FullStack**
Laura Isabella Tavera Contreras **FullStack**
Adrián Felipe Palacios Martínez **FullStack**
