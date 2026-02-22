from passlib.context import CryptContext
from datetime import datetime, timedelta 
from jose import jwt
from app.core.config import settings

# Configuramos el algoritmo de hashing. 
# 'deprecated="auto"' permite que si en el futuro bcrypt se vuelve obsoleto, 
# el sistema pueda manejar la transición a algo más nuevo.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Toma una contraseña plana y devuelve su hash seguro."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compara una contraseña plana con el hash guardado en la DB."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """Genera un JWT firmado con los datos del usuario y una fecha de expiración."""
    to_encode = data.copy()
    
    # Calculamos cuándo expira el token
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Añadimos la fecha de expiración ('exp' es un estándar de JWT)
    to_encode.update({"exp": expire})
    
    # Firmamos el token con nuestro algoritmo y llave secreta
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt