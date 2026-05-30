import httpx
from app.services.nlp_service import clasificar_pregunta  # tu BERT-CNN

OLLAMA_URL = "http://host.docker.internal:11434"  # o desde .env

SYSTEM_PROMPTS = {
    0: "Eres un tutor experto en Algoritmia y Estructuras de Datos para el examen EGEL-C...",
    1: "Eres un tutor experto en Arquitectura de Computadoras y Sistemas operativos...",
    2: "Eres un tutor experto en Ingeniería de Software, Bases de Datos y Ciberseguridad...",
    3: "Eres un tutor experto en Computación Inteligente y Sistemas Distribuidos...",
    "fuera": "Eres un tutor general de Ingeniería en Computación para el EGEL-C...",
}

async def chat_con_tutor(
    pregunta: str,
    area_override: int | None,   # si el alumno corrigió el área
    historial: list[dict]        # mensajes previos para contexto
) -> AsyncGenerator[str, None]:
    
    # 1. Clasificar con BERT-CNN (a menos que el alumno haya corregido)
    if area_override is not None:
        area = area_override
        confianza = 1.0
    else:
        resultado = clasificar_pregunta(pregunta)
        area = "fuera" if resultado["fuera_de_dominio"] else resultado["clase"]
        confianza = resultado["confianza"]
    
    system_prompt = SYSTEM_PROMPTS[area]
    
    # 2. Construir mensajes para Ollama
    messages = [{"role": "system", "content": system_prompt}]
    messages += historial  # contexto de la conversación previa
    messages.append({"role": "user", "content": pregunta})
    
    # 3. Llamar a Ollama con streaming
    async with httpx.AsyncClient(timeout=120) as client:
        async with client.stream("POST", f"{OLLAMA_URL}/api/chat", json={
            "model": "llama3.1:8b",
            "messages": messages,
            "stream": True
        }) as response:
            async for line in response.aiter_lines():
                if line:
                    yield line  # cada chunk del stream