import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, recall_score, classification_report

# Importamos a los 3 contendientes
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier

# ==========================================
# 1. GENERACIÓN DE DATOS SINTÉTICOS (10 FEATURES)
# ==========================================
print("1. Forjando la matriz de 10 dimensiones para 5,000 alumnos...")
np.random.seed(42)
n = 5000

# Características de conocimiento (0-100)
c_soft = np.random.normal(70, 15, n).clip(0, 100)
c_redes = np.random.normal(65, 18, n).clip(0, 100)
c_bd = np.random.normal(75, 12, n).clip(0, 100)
c_mates = np.random.normal(60, 20, n).clip(0, 100)
c_logica = np.random.normal(68, 15, n).clip(0, 100)

# Características de comportamiento
tiempo_promedio = np.random.normal(60, 20, n).clip(10, 120) # Segundos
omitidas = np.random.poisson(2, n).clip(0, 20)
cambios = np.random.poisson(3, n).clip(0, 10)
racha = np.random.normal(5, 3, n).clip(0, 30)
semestre = np.random.randint(6, 10, n) # Semestres del 6 al 9

# Lógica "Oculta" del Mundo Real para definir quién pasa (1) y quién reprueba (0)
# Le damos pesos lógicos: Las calificaciones suman puntos, las omitidas restan, el semestre avanzado ayuda.
score_oculto = (
    (c_soft * 0.25) + (c_bd * 0.20) + (c_mates * 0.20) + (c_logica * 0.20) + (c_redes * 0.15)
    - (omitidas * 2) 
    - (cambios * 0.5)
    + (racha * 1.5)
    + (semestre * 2)
)

# Agregamos ruido (el factor humano: nervios el día del examen, etc.)
score_final = score_oculto + np.random.normal(0, 8, n)

# Si superan la barrera imaginaria de 80 puntos en nuestro score oculto, pasan.
paso_ceneval = np.where(score_final >= 80, 1, 0)

# Armamos el DataFrame
df = pd.DataFrame({
    'calif_software': c_soft, 'calif_redes': c_redes, 'calif_bd': c_bd,
    'calif_matematicas': c_mates, 'calif_logica': c_logica,
    'tiempo_promedio': tiempo_promedio, 'preguntas_omitidas': omitidas,
    'cambios_respuesta': cambios, 'racha_aciertos': racha, 'semestre_actual': semestre,
    'paso_ceneval': paso_ceneval
})

os.makedirs('../data', exist_ok=True)
df.to_csv('../data/alumnos_v2.csv', index=False)

# ==========================================
# 2. PREPARACIÓN PARA LA ARENA (ENTRENAMIENTO)
# ==========================================
X = df.drop('paso_ceneval', axis=1)
y = df['paso_ceneval']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Normalización: Vital para la Regresión Logística (pone todo en la misma escala)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Definimos los 3 modelos con parámetros afinados
modelos = {
    "Regresion Logistica (Baseline)": LogisticRegression(max_iter=1000, random_state=42),
    
    "Random Forest (Afinado)": RandomForestClassifier(
        n_estimators=300,      # Aumentamos de 100 a 300 árboles
        max_depth=10,          # Controlamos la profundidad para evitar memorización
        min_samples_split=5,
        random_state=42
    ),
    
    "XGBoost (El Monstruo)": XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,    # Aprende más despacio pero más seguro
        random_state=42,
        eval_metric='logloss'
    )
}

# ==========================================
# 3. COMBATE Y EVALUACIÓN
# ==========================================
print("\n--- INICIANDO EL ENTRENAMIENTO CRUZADO ---")
mejor_modelo_nombre = ""
mejor_recall = 0

for nombre, modelo in modelos.items():
    print(f"\nEntrenando: {nombre}...")
    
    # La regresión logística necesita datos escalados, los árboles no, pero no les afecta.
    modelo.fit(X_train_scaled, y_train)
    
    predicciones = modelo.predict(X_test_scaled)
    
    acc = accuracy_score(y_test, predicciones)
    rec = recall_score(y_test, predicciones)
    
    print(f"Accuracy : {acc * 100:.2f}%")
    print(f"Recall   : {rec * 100:.2f}%")
    
    # Guardamos el mejor modelo basado en tu métrica estrella (Recall)
    if rec > mejor_recall:
        mejor_recall = rec
        mejor_modelo_nombre = nombre
        # Exportamos el ganador
        os.makedirs('../models', exist_ok=True)
        joblib.dump(modelo, '../models/modelo_ganador_v2.pkl')
        joblib.dump(scaler, '../models/scaler_v2.pkl') # Guardamos el escalador, es vital para el backend

print(f"\n🏆 EL GANADOR ES: {mejor_modelo_nombre} con un Recall de {mejor_recall * 100:.2f}%")
print("El modelo y el escalador han sido exportados a la carpeta /models/")