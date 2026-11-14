import os
from pathlib import Path
from dotenv import load_dotenv
from sqlmodel import Session, create_engine

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

# Recomendado: Obtener desde variables de entorno con un fallback local
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:admin@localhost:5432/studnova"
)

engine = create_engine(
    DATABASE_URL,
    echo=os.getenv("SQL_ECHO", "false").lower() == "true",
)

def obtener_sesion():
    with Session(engine) as sesion:
        yield sesion
