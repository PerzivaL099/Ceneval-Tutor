
import torch
import torch.nn as nn
from transformers import AutoModel, AutoTokenizer
import json
import os


MODEL_NAME = "dccuchile/bert-base-spanish-wwm-uncased"
NUM_CLASES = 4
MAX_LENGTH = 128

# Ruta al modelo exportado, resuelta desde la ubicación de este archivo.
# __file__ = data_science/src/nlp/inferencia_local.py
# Subimos 2 niveles (nlp -> src -> data_science) y entramos a modelo_exportado/
DIRECTORIO_MODELO = os.path.normpath(os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "..",
    "modelo_exportado"
))


class BERT_CNN(nn.Module):
    def __init__(self):
        super().__init__()
        # BERT se carga desde HuggingFace (queda en caché local tras la primera vez)
        self.bert = AutoModel.from_pretrained(MODEL_NAME)
        self.conv = nn.Conv1d(768, 128, kernel_size=3, padding=1)
        self.out  = nn.Linear(128, NUM_CLASES)

    def forward(self, ids, mask):
        x = self.bert(input_ids=ids, attention_mask=mask).last_hidden_state.permute(0, 2, 1)
        x = torch.relu(self.conv(x))
        return self.out(torch.max(x, dim=2)[0])



def cargar_modelo(directorio: str = DIRECTORIO_MODELO):
    
    ruta_pesos       = os.path.join(directorio, "pesos_bert_cnn.pt")
    ruta_tokenizador = os.path.join(directorio, "tokenizador")
    ruta_metadatos   = os.path.join(directorio, "metadatos.json")

    print(f" Buscando modelo en: {directorio}")

    # Paso 1: inicializar estructura vacía — BERT desde HuggingFace
    print("  Inicializando arquitectura BERT_CNN...")
    modelo = BERT_CNN()

    # Paso 2: cargar pesos entrenados — map_location='cpu' vital si no hay GPU
    print(" Cargando pesos entrenados desde disco...")
    pesos = torch.load(ruta_pesos, map_location=torch.device("cpu"))

    # Paso 3: inyectar pesos a la estructura vacía
    modelo.load_state_dict(pesos)

    # Paso 4: bloquear en modo evaluación (desactiva Dropout)
    modelo.eval()
    print(" Modelo en modo eval.")

    # Tokenizador desde archivos locales (sin llamadas a internet)
    tokenizador = AutoTokenizer.from_pretrained(ruta_tokenizador)
    print(" Tokenizador cargado.")

    with open(ruta_metadatos, "r", encoding="utf-8") as f:
        metadatos = json.load(f)

    print(" Metadatos cargados.")
    print(f"   Clases disponibles:")
    for k, v in metadatos["mapa_etiquetas"].items():
        print(f"   [{k}] {v}")
    print()

    return modelo, tokenizador, metadatos



UMBRAL_CONFIANZA = 60.0  # Porcentaje mínimo para aceptar una predicción

def predecir_texto(texto: str, modelo, tokenizador, metadatos) -> dict:
    
    encoding = tokenizador(
        texto,
        add_special_tokens=True,
        max_length=metadatos.get("max_length", MAX_LENGTH),
        padding="max_length",
        truncation=True,
        return_tensors="pt"
    )

    # Inferencia sin gradientes (ahorra ~40% RAM en producción)
    with torch.no_grad():
        logits = modelo(encoding["input_ids"], encoding["attention_mask"])

    probabilidades = torch.softmax(logits, dim=1)
    clase_numerica = torch.argmax(probabilidades, dim=1).item()
    confianza      = probabilidades[0][clase_numerica].item() * 100
    mapa           = metadatos["mapa_etiquetas"]

    todas_las_probs = {
        mapa[str(i)]: round(probabilidades[0][i].item() * 100, 2)
        for i in range(NUM_CLASES)
    }

    # Verificar si la confianza supera el umbral mínimo
    if confianza < UMBRAL_CONFIANZA:
        return {
            "etiqueta_predicha": "fuera_de_dominio",
            "clase_numerica":    -1,
            "confianza_pct":     round(confianza, 2),
            "fuera_de_dominio":  True,
            "todas_las_probs":   todas_las_probs
        }

    return {
        "etiqueta_predicha": mapa[str(clase_numerica)],
        "clase_numerica":    clase_numerica,
        "confianza_pct":     round(confianza, 2),
        "fuera_de_dominio":  False,
        "todas_las_probs":   todas_las_probs
    }



if __name__ == "__main__":
    modelo, tokenizador, metadatos = cargar_modelo()

    textos_prueba = [
        "¿Cuál es la complejidad temporal del algoritmo QuickSort?",
        "Explica la arquitectura Von Neumann y sus componentes principales.",
        "¿Qué diferencia hay entre SQL y NoSQL en bases de datos?",
        "¿Cómo funciona una red neuronal convolucional en deep learning?",
    ]

    print("=" * 65)
    print("PRUEBAS DE INFERENCIA — CENEVAL TUTOR")
    print("=" * 65)

    for texto in textos_prueba:
        resultado = predecir_texto(texto, modelo, tokenizador, metadatos)
        print(f"\n {texto}")
        print(f"   → {resultado['etiqueta_predicha']}")
        print(f"   → Confianza: {resultado['confianza_pct']}%")
        print(f"   → Distribución completa:")
        for area, prob in resultado["todas_las_probs"].items():
            barra = "█" * int(prob / 5)
            print(f"      {barra:20s} {prob:5.1f}%  {area}")