from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas import diagnostic as diagnostic_schema
from app.services import diagnostic_service
from fastapi import HTTPException

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
# INIT: CREACIÓN DE TABLAS
# -----------------------------------------------------------------------------
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ceneval Tutor API", version="1.0.0")

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
    # 1. Validación de Negocio: ¿El usuario ya existe?
    db_user = user_service.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 2. Creación: Delegamos al servicio
    return user_service.create_user(db=db, user=user)

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Endpoint para autenticación.
    Arquitectura: Usamos OAuth2PasswordRequestForm estándar. Esto permite que 
    la documentación automática de Swagger (el botón 'Authorize') funcione nativamente.
    """
    # 1. Buscar al usuario en la base de datos (OAuth2 usa 'username', nosotros le pasaremos el email)
    user = user_service.get_user_by_email(db, email=form_data.username)
    
    # 2. Verificar que el usuario exista Y que la contraseña coincida con el hash
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Email o contraseña incorrectos")
    
    # 3. Generar el Token JWT
    # El campo 'sub' (subject) es estándar en JWT para identificar a quién pertenece
    access_token = create_access_token(data={"sub": user.email})
    
    # 4. Retornar el token en el formato estándar esperado por los clientes HTTP
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=user_schema.User)
def read_users_me(current_user: user_model.User = Depends(get_current_user)):
    """
    Endpoint PROTEGIDO. 
    Al inyectar 'Depends(get_current_user)', FastAPI automáticamente exige un token válido.
    Si el token es correcto, la variable 'current_user' tendrá los datos del usuario.
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