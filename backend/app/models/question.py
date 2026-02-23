from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False) # El enunciado de la pregunta
    option_a = Column(String, nullable=False)
    option_b = Column(String, nullable=False)
    option_c = Column(String, nullable=False)
    option_d = Column(String, nullable=False)
    correct_answer = Column(String(1), nullable=False) # Guardaremos 'a', 'b', 'c' o 'd'
    category = Column(String, index=True, nullable=False) # Ej: 'Compiladores', 'Ingeniería de Software'
    difficulty = Column(Float, nullable=False, default=0.5)
    # Llave Foránea: Vincula esta pregunta con un ID de examen
    exam_id = Column(Integer, ForeignKey("exams.id"))

    # Relación inversa: Permite acceder al objeto Exam desde una Question
    exam = relationship("Exam", back_populates="questions")