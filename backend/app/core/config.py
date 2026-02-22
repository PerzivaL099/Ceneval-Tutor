from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    # 1. Información del Proyecto
    PROJECT_NAME: str = "Ceneval Tutor API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # 2. Base de Datos
    # Definimos la URL por defecto para Docker (interno).
    # Si existe una variable de entorno "DATABASE_URL" en el sistema, Pydantic la usará en su lugar.
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@ceneval_db:5432/ceneval_tutor"
    )

    # -------------------------------------------------------------------------
    # NUEVO: Configuración de JWT (JSON Web Token)
    # -------------------------------------------------------------------------
    #  
    # 
    SECRET_KEY: str 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 # El gafete caduca en 30 minutos
    class Config:
        # Esto permite leer un archivo .env local automáticamente
        env_file = ".env"
        case_sensitive = True

# Instanciamos la configuración para importarla en otros lados
settings = Settings()