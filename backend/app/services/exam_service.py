from sqlalchemy.orm import Session
from app.models.exam import Exam
from app.models.question import Question
from app.schemas import exam as exam_schema
from app.schemas import question as question_schema

# --- Lógica de Exámenes ---
def create_exam(db: Session, exam: exam_schema.ExamCreate):
    db_exam = Exam(title=exam.title, description=exam.description)
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    return db_exam

def get_exams(db: Session):
    return db.query(Exam).all()

# --- Lógica de Preguntas ---
def create_question(db: Session, question: question_schema.QuestionCreate):
    # Desempaquetamos todos los datos de la pregunta directamente
    db_question = Question(**question.model_dump())
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question