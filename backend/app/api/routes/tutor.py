# backend/app/api/routes/tutor.py  ← NUEVO archivo

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.services.tutor_service import chat_con_tutor
from app.schemas.tutor import ChatRequest  # Pydantic schema

router = APIRouter(prefix="/api/tutor", tags=["Tutor IA"])

@router.post("/chat")
async def chat(req: ChatRequest, user=Depends(get_current_user)):
    return StreamingResponse(
        chat_con_tutor(req.pregunta, req.area_override, req.historial),
        media_type="text/event-stream"
    )

@router.get("/areas")
def listar_areas():
    """Devuelve las 4 áreas para que el frontend muestre el selector de corrección"""
    return {"areas": [
        {"id": 0, "nombre": "Algoritmia y Estructuras de Datos"},
        {"id": 1, "nombre": "Arquitectura de Computadoras"},
        {"id": 2, "nombre": "Ingeniería de Software, BD y Ciberseguridad"},
        {"id": 3, "nombre": "Computación Inteligente y Sistemas Distribuidos"},
    ]}