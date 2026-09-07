from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modelos.plan_estudio import PlanDeEstudio
    from app.modelos.progreso import Progreso
    from app.modelos.control_fatiga import ControlFatiga
    from app.modelos.sesion_estudio import SesionEstudio


class Usuario(SQLModel, table=True):
    __tablename__ = "usuario"

    id_usuario: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100)
    correo: str = Field(max_length=150, unique=True, index=True)
    contraseña: str = Field(max_length=255)

    planes: List["PlanDeEstudio"] = Relationship(back_populates="usuario")
    progresos: List["Progreso"] = Relationship(back_populates="usuario")
    fatigas: List["ControlFatiga"] = Relationship(back_populates="usuario")
    sesiones: List["SesionEstudio"] = Relationship(back_populates="usuario")
