from pydantic import BaseModel, Field
from typing import Dict


class ClasificadorRequest(BaseModel):
    texto: str = Field(
        ...,
        min_length=5,
        max_length=1000,
        description="Pregunta o texto del estudiante a clasificar"
    )

# -----------------------------------------------------------------------------
# RESPONSE
# Lo que el endpoint devuelve al frontend
# -----------------------------------------------------------------------------
class ClasificadorResponse(BaseModel):
    etiqueta_predicha: str = Field(
        description="Área CENEVAL predicha, o 'fuera_de_dominio' si no supera el umbral"
    )
    clase_numerica: int = Field(
        description="Índice de la clase (0-3), o -1 si está fuera de dominio"
    )
    confianza_pct: float = Field(
        description="Porcentaje de confianza de la predicción"
    )
    fuera_de_dominio: bool = Field(
        description="True si el texto no corresponde a ninguna área CENEVAL"
    )
    todas_las_probs: Dict[str, float] = Field(
        description="Distribución completa de probabilidades por clase"
    )
    mensaje: str = Field(
        description="Mensaje legible para mostrar al usuario en el frontend"
    )