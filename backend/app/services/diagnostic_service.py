import joblib
import os
import numpy as np
from app.schemas.diagnostic import DiagnosticRequest, DiagnosticResponse

# 1. Definir rutas absolutas para que Docker encuentre los archivos sin importar desde dónde se ejecute
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "ml", "modelo_ganador_v2.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "ml", "scaler_v2.pkl")

# 2. Cargar los modelos en memoria global (Singleton) al arrancar la app
try:
    modelo_rf = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print("🧠 Modelos de IA cargados correctamente en memoria.")
except Exception as e:
    print(f"❌ Error al cargar los modelos de IA: {e}")
    modelo_rf = None
    scaler = None

def predict_ceneval(data: DiagnosticRequest) -> DiagnosticResponse:
    if not modelo_rf or not scaler:
        raise ValueError("El modelo de IA no está disponible en el servidor.")

    # 3. Extraer las características en el MISMO ORDEN exacto que usamos en train_v2.py
    features = np.array([[
        data.calif_software,
        data.calif_redes,
        data.calif_bd,
        data.calif_matematicas,
        data.calif_logica,
        data.tiempo_promedio,
        data.preguntas_omitidas,
        data.cambios_respuesta,
        data.racha_aciertos,
        data.semestre_actual
    ]])

    # 4. Escalar los datos (vital para que el modelo no se confunda con los números)
    features_scaled = scaler.transform(features)

    # 5. Hacer la predicción (0 = Reprobado, 1 = Aprobado)
    prediccion = modelo_rf.predict(features_scaled)[0]
    
    # Extraer la probabilidad real de la clase 1 (Aprobado)
    probabilidad = modelo_rf.predict_proba(features_scaled)[0][1]

    # 6. Formatear la respuesta para el Frontend
    resultado_texto = "Aprobado" if prediccion == 1 else "Reprobado"
    mensaje = "¡Excelente desempeño! Tienes altas probabilidades de pasar." if prediccion == 1 else "Detectamos áreas de oportunidad. Necesitas reforzar tus conocimientos antes del examen."

    return DiagnosticResponse(
        probabilidad_aprobar=round(probabilidad * 100, 2),
        prediccion=resultado_texto,
        mensaje=mensaje
    )