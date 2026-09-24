import os
from pathlib import Path
from dotenv import load_dotenv
from sqlmodel import SQLModel, Session, create_engine, text

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

# Recomendado: Obtener desde variables de entorno con un fallback local
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:admin@localhost:5432/studnova"
)

engine = create_engine(DATABASE_URL, echo=True)

def obtener_sesion():
    with Session(engine) as sesion:
        yield sesion

def crear_tablas():
    import app.modelos
    SQLModel.metadata.create_all(engine)
    
    # Auto-migración: Asegurar columnas nuevas en la BD
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE prompt_ia ADD COLUMN IF NOT EXISTS embedding TEXT;"))
            conn.execute(text("ALTER TABLE prompt_ia ADD COLUMN IF NOT EXISTS id_usuario INTEGER REFERENCES usuario(id_usuario);"))
            conn.execute(text("ALTER TABLE prompt_ia ALTER COLUMN id_plan DROP NOT NULL;"))
            conn.execute(text("ALTER TABLE plan_de_estudio ADD COLUMN IF NOT EXISTS id_ruta INTEGER;"))
            conn.commit()
    except Exception as e:
        print(f"⚠️ Info sobre migración de base de datos: {e}")
