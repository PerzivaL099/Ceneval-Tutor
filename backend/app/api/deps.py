from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from app.core.config import settings
from app.database import get_db
from app.services.user_service import get_user_by_email

# Esto le dice a FastAPI (y a Swagger UI) dónde está el endpoint para obtener el token.
# Gracias a esto, aparecerá el botón verde "Authorize" en tu documentación.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Este es el "candado". Exige un token, lo decodifica, verifica quién es el usuario,
    lo busca en la base de datos y lo devuelve. Si algo falla, rechaza la petición.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 1. Intentamos abrir el token con nuestra llave secreta
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        # 2. Extraemos el email (que guardamos en el campo 'sub')
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
            
    except JWTError:
        # Si el token expiró o fue alterado, fallará aquí
        raise credentials_exception
        
    # 3. Buscamos al usuario en la base de datos
    user = get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
        
    # 4. Devolvemos el objeto usuario (ahora la ruta que use este candado sabrá quién hace la petición)
    return user