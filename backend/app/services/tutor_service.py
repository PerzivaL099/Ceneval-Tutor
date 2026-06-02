import os
import httpx
from typing import AsyncGenerator

# 1. PASAMOS EL CLASIFICADOR A SEGUNDO PLANO (COMENTADO POR HOY)
# from app.services.nlp_service import clasificar_pregunta  

# 2. SE CONECTA CORRECTAMENTE A LA RED DE DOCKER USANDO EL .ENV
OLLAMA_URL = os.getenv("OLLAMA_BASE_URL", "http://ollama:11434")

SYSTEM_PROMPTS = {
    0: "Eres un tutor experto en Algoritmia y Estructuras de Datos...",
    1: "Eres un tutor experto en Arquitectura de Computadoras y Sistemas...",
    2: "Eres un tutor experto en Ingeniería de Software, Bases de Datos y Ciberseguridad...",
    3: "Eres un tutor experto en Computación Inteligente y Sistemas Distribuidos...",
    "fuera": "Eres un tutor general de Ingeniería en Computación..."
}

async def chat_con_tutor(
    pregunta: str,
    area_override: int | None,
    historial: list[dict]
) -> AsyncGenerator[str, None]:
    
    # 3. DETERMINAR EL SYSTEM PROMPT REQUERIDO
    # Si el alumno seleccionó un área manualmente en el dropdown o mandó una por defecto
    area_id = area_override if area_override is not None else "fuera"
    system_prompt = SYSTEM_PROMPTS.get(area_id, SYSTEM_PROMPTS["fuera"])
    
    # 4. CONSTRUIR EL PAYLOAD PARA OLLAMA
    messages = [{"role": "system", "content": system_prompt}]
    
    # Inyectar el historial acumulado de la sesión
    for msg in historial:
        messages.append({"role": msg["role"], "content": msg["content"]})
        
    # Añadir la pregunta actual del alumno
    messages.append({"role": "user", "content": pregunta})
    
    # 5. DISPARAR PIPELINE ASÍNCRONO HACIA OLLAMA
    async with httpx.AsyncClient(timeout=httpx.Timeout(300.0, read=None)) as client:
        async with client.stream(
            "POST",
            f"{OLLAMA_URL}/api/chat",
            json={
                "model": os.getenv("OLLAMA_MODEL", "llama3.1:8b"),
                "messages": messages,
                "stream": True
            }
        ) as response:
            if response.status_code != 200:
                yield "Error al conectar con el motor de IA local."
                return
                
            async for chunk in response.aiter_lines():
                if chunk:
                    import json
                    try:
                        data = json.loads(chunk)
                        content = data.get("message", {}).get("content", "")
                        if content:
                            payload = {
                                "message": {"content": content},
                                "area": area_id if isinstance(area_id, int) else None,
                                "confianza_pct": 100 if isinstance(area_id, int) else None
                            }
                            yield f"data: {json.dumps(payload)}\n\n"
                    except json.JSONDecodeError:
                        continue