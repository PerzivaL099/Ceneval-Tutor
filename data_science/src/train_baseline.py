import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, recall_score, classification_report
import os
import joblib # Para guardar el modelo entrenado

# ==========================================
# 1. GENERACIÓN DE DATOS SINTÉTICOS
# ==========================================
print("1. Generando datos sintéticos de 5,000 alumnos...")
np.random.seed(42) # Para que siempre nos salgan los mismos datos aleatorios
n_alumnos = 5000

# Simulamos las calificaciones de 3 áreas del examen diagnóstico (de 0 a 100)
calif_software = np.random.normal(70, 15, n_alumnos).clip(0, 100)
calif_redes = np.random.normal(65, 18, n_alumnos).clip(0, 100)
calif_bd = np.random.normal(75, 12, n_alumnos).clip(0, 100)

# Lógica del Mundo Real: El promedio ponderado dicta si aprueba o no.
# Supongamos que Software pesa más en este CENEVAL.
promedio_real = (calif_software * 0.4) + (calif_redes * 0.3) + (calif_bd * 0.3)

# Si el promedio es mayor a 70, hay alta probabilidad de aprobar (1), sino (0).
# Agregamos un poco de "ruido" aleatorio para que el modelo no tenga un trabajo demasiado fácil y sea realista.
ruido = np.random.normal(0, 5, n_alumnos)
paso_ceneval = np.where((promedio_real + ruido) >= 70, 1, 0)

# Armamos nuestro DataFrame (nuestra tabla)
df = pd.DataFrame({
    'calif_software': calif_software,
    'calif_redes': calif_redes,
    'calif_bd': calif_bd,
    'paso_ceneval': paso_ceneval
})

# Guardamos los datos para poder analizarlos después
os.makedirs('../data', exist_ok=True)
df.to_csv('../data/alumnos_simulados.csv', index=False)
print("Datos guardados en data/alumnos_simulados.csv")


# ==========================================
# 2. ENTRENAMIENTO DEL MODELO (RANDOM FOREST)
# ==========================================
print("\n2. Entrenando el modelo Random Forest...")

# Separamos las Características (X) de nuestro Objetivo (y)
X = df[['calif_software', 'calif_redes', 'calif_bd']]
y = df['paso_ceneval']

# Dividimos los datos: 80% para estudiar (entrenar), 20% para hacerle un examen al modelo (testear)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Inicializamos el "cerebro" (Random Forest con 100 árboles de decisión)
modelo = RandomForestClassifier(n_estimators=100, random_state=42)

# Entrenamos el modelo con los datos de estudio
modelo.fit(X_train, y_train)


# ==========================================
# 3. EVALUACIÓN Y EXPORTACIÓN
# ==========================================
print("\n3. Evaluando el rendimiento...")
predicciones = modelo.predict(X_test)

# Calculamos las métricas que definiste en tu plan (Accuracy y Recall)
exactitud = accuracy_score(y_test, predicciones)
sensibilidad = recall_score(y_test, predicciones)

print(f"-> Accuracy (Exactitud Global): {exactitud * 100:.2f}%")
print(f"-> Recall (Capacidad de detectar a los que aprueban): {sensibilidad * 100:.2f}%")
print("\nReporte detallado:")
print(classification_report(y_test, predicciones))

# Guardamos el cerebro entrenado en un archivo físico para que FastAPI lo use después
os.makedirs('../models', exist_ok=True)
joblib.dump(modelo, '../models/random_forest_baseline.pkl')
print("Modelo exportado exitosamente a models/random_forest_baseline.pkl")