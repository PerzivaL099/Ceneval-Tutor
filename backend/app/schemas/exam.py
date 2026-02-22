from pydantic import BaseModel
from typing import Optional

# 1. Esquema Base (Atributos compartidos)
class ExamBase(BaseModel):
    title: str
    description: Optional[str] = None

# 2. Esquema para CREAR (Input)
# Por ahora es igual al base, pero aquí podríamos agregar validaciones extra.
class ExamCreate(ExamBase):
    pass

# 3. Esquema de RESPUESTA (Output)
# Incluye el ID que genera la base de datos.
class Exam(ExamBase):
    id: int

    class Config:
        # Permite leer datos desde los modelos de SQLAlchemy
        from_attributes = True