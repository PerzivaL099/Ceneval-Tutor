from pydantic import BaseModel, Field

class DiagnosticRequest(BaseModel):
    # Calificaciones por área (0 a 100)
    calif_software: float = Field(..., ge=0, le=100, description="Calificación en Ingeniería de Software")
    calif_redes: float = Field(..., ge=0, le=100, description="Calificación en Redes")
    calif_bd: float = Field(..., ge=0, le=100, description="Calificación en Bases de Datos")
    calif_matematicas: float = Field(..., ge=0, le=100, description="Calificación en Matemáticas")
    calif_logica: float = Field(..., ge=0, le=100, description="Calificación en Lógica y Algoritmos")
    
    # Comportamiento durante el examen
    tiempo_promedio: float = Field(..., ge=0, description="Tiempo promedio por pregunta en segundos")
    preguntas_omitidas: int = Field(..., ge=0, description="Cantidad de preguntas sin contestar")
    cambios_respuesta: int = Field(..., ge=0, description="Veces que el alumno cambió de opción")
    racha_aciertos: int = Field(..., ge=0, description="Mayor cantidad de aciertos consecutivos")
    
    # Contexto del alumno
    semestre_actual: int = Field(..., ge=1, le=12, description="Semestre que cursa actualmente el alumno")

class DiagnosticResponse(BaseModel):
    probabilidad_aprobar: float
    prediccion: str # "Aprobado" o "Reprobado"
    mensaje: str