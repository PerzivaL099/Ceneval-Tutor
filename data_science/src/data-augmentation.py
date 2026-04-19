import pandas as pd
import ollama
import json

# Configuración del modelo
MODELO_LOCAL = "gemma2:9b"

# Estrategia de Upsampling (Diferenciada por el desbalance que vimos)
VARIANTES_POR_CLASE = {
    0: 2,  # Algoritmia
    1: 4,  # Soft. Base (El que más necesita)
    3: 1   # Inteligencia Computacional
}

def generar_variantes_gemma(texto_original, num_variantes):
    if num_variantes == 0: return []

    # Prompt optimizado para modelos académicos
    prompt = f"""
    Eres un evaluador de carreras de Ingeniería en Computación.
    Tengo este reactivo: "{texto_original}"
    Genera {num_variantes} variantes que evalúen el mismo concepto pero con diferente redacción o un caso práctico.
    
    RESPONDE EXCLUSIVAMENTE CON UN ARREGLO JSON.
    Ejemplo: ["variante 1", "variante 2"]
    """
    
    try:
        response = ollama.chat(model=MODELO_LOCAL, messages=[
            {'role': 'user', 'content': prompt},
        ])
        
        content = response['message']['content']
        # Limpieza de markdown por si Gemma se pone creativa
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
            
        return json.loads(content.strip())
    except Exception as e:
        print(f"  [!] Error local: {e}")
        return []

def ejecutar_aumento_final():
    print(f"z Cargando {MODELO_LOCAL} en CPU... esto puede tardar un poco.")
    df_base = pd.read_csv("data/dataset_base.csv")
    final_data = []

    # Procesamos solo lo necesario para ahorrar tiempo
    for i, row in df_base.iterrows():
        etiqueta = row['etiqueta']
        num_v = VARIANTES_POR_CLASE.get(etiqueta, 0)
        
        # Agregamos la original siempre
        final_data.append(row.to_dict())
        
        if num_v > 0:
            print(f"[{i}/{len(df_base)}] Creando {num_v} variantes para etiqueta {etiqueta}...")
            variantes = generar_variantes_gemma(row['texto'], num_v)
            for v in variantes:
                new_row = row.to_dict()
                new_row['texto'] = v
                new_row['area_origen'] += "_gemma_local"
                final_data.append(new_row)

    # Guardar el dataset definitivo
    df_final = pd.DataFrame(final_data)
    df_final.to_csv("data/dataset_ceneval_final.csv", index=False, encoding='utf-8')
    print(f" ¡Hecho! Dataset balanceado con {len(df_final)} preguntas.")

if __name__ == "__main__":
    ejecutar_aumento_final()