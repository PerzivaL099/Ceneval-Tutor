from pydantic import BaseModel

class QuestionBase(BaseModel):
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str # Debe ser 'a', 'b', 'c' o 'd'
    exam_id: int # Llave foránea para saber a qué examen pertenece

class QuestionCreate(QuestionBase):
    pass

class Question(QuestionBase):
    id: int

    class Config:
        from_attributes = True