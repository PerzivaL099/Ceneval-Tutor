from pydantic import BaseModel

class MensajeChat(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    pregunta: str
    area_override: int | None = None
    historial: list[MensajeChat] = []