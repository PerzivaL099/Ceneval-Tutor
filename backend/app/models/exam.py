from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    # Arquitectura: Usamos 'Text' en lugar de 'String' para descripciones largas
    # porque 'String' suele tener límite (ej. 255 chars) y 'Text' es ilimitado en Postgres.

    questions = relationship("Question", back_populates="exam", cascade="all, delete-orphan")