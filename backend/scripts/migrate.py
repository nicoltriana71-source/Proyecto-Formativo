import sys
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import inspect, text

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from base_datos import engine

ALEMBIC_INI = PROJECT_ROOT / "backend" / "alembic.ini"
BASELINE_REVISION = "f5bd2a5faef5"


def main() -> None:
    inspector = inspect(engine)
    has_version_table = inspector.has_table("alembic_version")
    has_current_version = False

    if has_version_table:
        with engine.connect() as connection:
            has_current_version = (
                connection.execute(
                    text("SELECT version_num FROM alembic_version LIMIT 1")
                ).scalar()
                is not None
            )

    config = Config(str(ALEMBIC_INI))

    if inspector.has_table("usuario") and not has_current_version:
        print("Base de datos existente sin historial de Alembic; marcando baseline.")
        command.stamp(config, BASELINE_REVISION)

    print("Aplicando migraciones de Alembic...")
    command.upgrade(config, "head")

    engine.dispose()


if __name__ == "__main__":
    main()
