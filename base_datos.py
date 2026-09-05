import os
from pathlib import Path
from dotenv import load_dotenv
from sqlmodel import SQLModel, Session, create_engine

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

# Recomendado: Obtener desde variables de entorno con un fallback local
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:1234@localhost:5432/studnova"
)

engine = create_engine(DATABASE_URL, echo=True)

def obtener_sesion():
    with Session(engine) as sesion:
        yield sesion

def crear_tablas():
    import app.modelos
    SQLModel.metadata.create_all(engine)