from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship, Column
import sqlalchemy as sa

if TYPE_CHECKING:
    from backend.app.modelos.plan_estudio import PlanDeEstudio
    from backend.app.modelos.progreso import Progreso
    from backend.app.modelos.control_fatiga import ControlFatiga
    from backend.app.modelos.sesion_estudio import SesionEstudio


class Usuario(SQLModel, table=True):
    __tablename__ = "usuario"
    __table_args__ = {"extend_existing": True}

    id_usuario: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100)
    correo: str = Field(max_length=150, unique=True, index=True)
    
    contraseña: str = Field(sa_column=Column("contrase\u00f1a", sa.String(255), nullable=False))

    acepto_terminos: bool = Field(
        default=False,
        sa_column=Column(sa.Boolean, nullable=False, server_default=sa.text("false")),
    )
    version_politica: Optional[str] = Field(default=None, max_length=20)
    fecha_aceptacion: Optional[datetime] = Field(default=None)

    planes: List["PlanDeEstudio"] = Relationship(back_populates="usuario")
    progresos: List["Progreso"] = Relationship(back_populates="usuario")
    fatigas: List["ControlFatiga"] = Relationship(back_populates="usuario")
    sesiones: List["SesionEstudio"] = Relationship(back_populates="usuario")
    