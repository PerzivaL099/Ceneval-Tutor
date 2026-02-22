# backend/app/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# -----------------------------------------------------------------------------
# 1. CONFIGURACIÓN DE LA CONEXIÓN (INFRAESTRUCTURA)
# -----------------------------------------------------------------------------
# Aquí definimos la URL de conexión.
# IMPORTANTE PARA DOCKER:
# 'ceneval_db' es el nombre del SERVICIO en tu docker-compose.yml.
# Docker tiene un DNS interno que resuelve ese nombre a la IP del contenedor de base de datos.
# Si estuvieras en local sin Docker, esto sería 'localhost'.
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:postgres@ceneval_db:5432/ceneval_tutor"
)

# -----------------------------------------------------------------------------
# 2. EL MOTOR (ENGINE) - PATRÓN POOL DE CONEXIONES
# -----------------------------------------------------------------------------
# create_engine gestiona un "pool" (piscina) de conexiones abiertas.
# En lugar de abrir/cerrar conexión por cada consulta (lento), reutiliza las activas.
engine = create_engine(DATABASE_URL)

# -----------------------------------------------------------------------------
# 3. LA FÁBRICA DE SESIONES (SESSION FACTORY)
# -----------------------------------------------------------------------------
# SessionLocal es una "fábrica" que crea nuevas sesiones de base de datos.
# autocommit=False: Queremos controlar cuándo guardar (commit) explícitamente.
# autoflush=False: Evita que SQLAlchemy envíe cambios a la DB antes de que estemos listos.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# -----------------------------------------------------------------------------
# 4. LA CLASE BASE (ORM MAPPING)
# -----------------------------------------------------------------------------
# Base es la clase de la que heredarán todos tus Modelos (Tablas).
# Funciona como un "registro": SQLAlchemy sabrá qué tablas existen mirando quién hereda de esto.
Base = declarative_base()

# -----------------------------------------------------------------------------
# 5. INYECCIÓN DE DEPENDENCIAS (DEPENDENCY INJECTION)
# -----------------------------------------------------------------------------
# Esta función es crucial para FastAPI. Implementa el ciclo de vida de una conexión:
# 1. Abrir sesión (db = SessionLocal())
# 2. Entregar sesión al endpoint (yield db)
# 3. Cerrar sesión SIEMPRE, pase lo que pase (finally: db.close())
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()