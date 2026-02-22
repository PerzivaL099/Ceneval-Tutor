from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base

class User(Base):
    # 1. Nombre de la Tabla en SQL
    # SQLAlchemy usará este nombre exacto para crear la tabla en Postgres.
    __tablename__ = "users"

    # 2. Columnas y Tipos de Datos
    # Definimos la estructura. SQLAlchemy traduce 'Integer' a 'INTEGER', 'String' a 'VARCHAR', etc.
    
    id = Column(Integer, primary_key=True, index=True)
    # primary_key=True: Identificador único.
    # index=True: Crea un índice B-Tree en la base de datos. 
    # ARQUITECTURA: Fundamental para búsquedas rápidas (O(log n)) en lugar de escanear toda la tabla.

    email = Column(String, unique=True, index=True)
    # unique=True: Restricción de integridad (Constraint). La DB rechazará duplicados.
    # index=True: Necesario porque buscaremos usuarios por email frecuentemente en el login.

    hashed_password = Column(String)
    # SEGURIDAD: Nunca guardamos passwords en texto plano. 
    # Aquí guardaremos el hash (ej. bcrypt), que es una cadena larga.

    is_active = Column(Boolean, default=True)
    # Soft Delete: En lugar de borrar usuarios (DELETE), es mejor desactivarlos 
    # para mantener integridad referencial e historial.