from pydantic import BaseModel, EmailStr

# 1. Esquema Base (Atributos compartidos)
class UserBase(BaseModel):
    email: EmailStr

# 2. Esquema para CREAR (Input)
# Este es el que tu servicio está buscando y no encuentra.
# Incluye el password porque el usuario lo envía al registrarse.
class UserCreate(UserBase):
    password: str

# 3. Esquema de RESPUESTA (Output)
# Este es el que usamos para responderle al cliente.
# NO incluye el password por seguridad.
class User(UserBase):
    id: int
    is_active: bool

    class Config:
        # Esto permite a Pydantic leer datos directamente de los modelos de SQLAlchemy
        from_attributes = True