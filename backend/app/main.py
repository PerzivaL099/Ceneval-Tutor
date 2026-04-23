from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.schemas import diagnostic as diagnostic_schema
from app.services import diagnostic_service

# Importamos la infraestructura
from app.database import engine, Base, get_db

# Importamos los componentes de nuestra arquitectura
from app.models import user as user_model
from app.schemas import user as user_schema
from app.services import user_service
from app.models import user, exam, question

from fastapi.security import OAuth2PasswordRequestForm
from app.core.security import verify_password, create_access_token
from app.api.deps import get_current_user
from app.schemas import exam as exam_schema
from app.schemas import question as question_schema
from app.services import exam_service
from typing import List

# -----------------------------------------------------------------------------
# NUEVO: Clasificador NLP (BERT_CNN)
# -----------------------------------------------------------------------------
from app.schemas import nlp as nlp_schema
from app.services import nlp_service

# -----------------------------------------------------------------------------
# INIT: CREACIÓN DE TABLAS
# -----------------------------------------------------------------------------
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ceneval Tutor API", version="1.0.0")

# -----------------------------------------------------------------------------
# CORS: Permite que el frontend React se comunique con la API
# -----------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# RUTAS (ENDPOINTS)
# -----------------------------------------------------------------------------

@app.post("/users/", response_model=user_schema.User)
def create_user(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    """
    Crea un nuevo usuario en el sistema.

    Arquitectura:
    1. Recibe el JSON validado por el Schema (UserCreate).
    2. Inyecta la sesión de DB (Dependency Injection).
    3. Llama al Servicio para verificar lógica de negocio (¿existe el email?).
    4. Llama al Servicio para persistir datos.
    5. Retorna el objeto Usuario, filtrando el password gracias a response_model.
    """
    db_user = user_service.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return user_service.create_user(db=db, user=user)


@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Endpoint para autenticación.
    Arquitectura: Usamos OAuth2PasswordRequestForm estándar. Esto permite que
    la documentación automática de Swagger (el botón 'Authorize') funcione nativamente.
    """
    user = user_service.get_user_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Email o contraseña incorrectos")
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/me", response_model=user_schema.User)
def read_users_me(current_user: user_model.User = Depends(get_current_user)):
    """
    Endpoint PROTEGIDO.
    Al inyectar 'Depends(get_current_user)', FastAPI automáticamente exige un token válido.
    """
    return current_user


@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API del Tutor Inteligente CENEVAL", "status": "running"}


@app.get("/health")
def health_check():
    return {"status": "ok", "database": "connected"}


# ---------------------------------------------------------
# RUTAS DE EXÁMENES Y PREGUNTAS (FASE 3)
# ---------------------------------------------------------

@app.post("/exams/", response_model=exam_schema.Exam)
def create_exam(exam: exam_schema.ExamCreate, db: Session = Depends(get_db)):
    """Crea un nuevo examen vacío."""
    return exam_service.create_exam(db=db, exam=exam)


@app.get("/exams/", response_model=List[exam_schema.Exam])
def read_exams(db: Session = Depends(get_db)):
    """Obtiene todos los exámenes con sus respectivas preguntas anidadas."""
    return exam_service.get_exams(db)


@app.post("/questions/", response_model=question_schema.Question)
def create_question(question: question_schema.QuestionCreate, db: Session = Depends(get_db)):
    """Agrega una pregunta a un examen existente mediante el exam_id."""
    return exam_service.create_question(db=db, question=question)


# ---------------------------------------------------------
# RUTAS DEL MOTOR DIAGNÓSTICO (FASE 4)
# ---------------------------------------------------------

@app.post("/diagnostico/", response_model=diagnostic_schema.DiagnosticResponse)
def get_diagnostic_prediction(data: diagnostic_schema.DiagnosticRequest):
    """
    Recibe el desempeño de un alumno en el examen de diagnóstico
    y devuelve la predicción del modelo Random Forest.
    """
    try:
        return diagnostic_service.predict_ceneval(data)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# RUTAS DEL CLASIFICADOR NLP — BERT_CNN (FASE 5)
# ---------------------------------------------------------

@app.post("/clasificar/", response_model=nlp_schema.ClasificadorResponse)
def clasificar_pregunta(data: nlp_schema.ClasificadorRequest):
    """
    Clasifica el texto de un estudiante en una de las 4 áreas CENEVAL
    usando el modelo BERT_CNN entrenado (F1-Score Macro: 0.78).

    Áreas posibles:
    - [0] Algoritmia y Estructuras de Datos
    - [1] Arquitectura de Computadoras y Sistemas
    - [2] Ingeniería de Software, Bases de Datos y Ciberseguridad
    - [3] Computación Inteligente y Sistemas Distribuidos

    Si el texto no corresponde a ninguna área (confianza < 60%),
    retorna fuera_de_dominio=True y clase_numerica=-1.

    Ejemplo de request:
        {"texto": "¿Cuál es la complejidad del algoritmo QuickSort?"}

    Ejemplo de response:
        {
            "etiqueta_predicha": "Algoritmia y Estructuras de Datos",
            "clase_numerica": 0,
            "confianza_pct": 96.16,
            "fuera_de_dominio": false,
            "todas_las_probs": {...},
            "mensaje": "Tu pregunta corresponde al área: ..."
        }
    """
    try:
        return nlp_service.clasificar_texto(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en clasificación: {str(e)}")