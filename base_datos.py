import os
from pathlib import Path
from dotenv import load_dotenv
from sqlmodel import SQLModel, Session, create_engine, text

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
    
    # Auto-migración: Asegurar que columnas nuevas como 'embedding' existan en la tabla prompt_ia
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE prompt_ia ADD COLUMN IF NOT EXISTS embedding TEXT;"))
            conn.commit()
    except Exception as e:
        print(f"⚠️ Info sobre migración de prompt_ia.embedding: {e}")