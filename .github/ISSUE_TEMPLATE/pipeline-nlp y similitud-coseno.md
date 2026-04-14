---
name: "🧠 Feature: Pipeline NLP (Data Science)"
about: "Laboratorio para embeddings y cálculo de similitud del coseno."
title: "[FEAT] Pipeline de NLP: Embeddings y Similitud del Coseno"
labels: ["deep-learning", "data-science", "nlp"]
assignees: ''
---
## 🎯 Objetivo Arquitectónico
Implementar la base matemática de **Deep Representation Learning** para el motor semántico. No tocaremos el servidor aún; el objetivo es probar el modelo en el laboratorio (Jupyter) usando Aprendizaje por Transferencia.

## 📋 Tareas
- [ ] Implementar un modelo Transformer ligero preentrenado (ej. `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`).
- [ ] Definir los "Vectores Ancla" (Centros de gravedad) para las categorías principales (Redes, Bases de Datos, Ingeniería de Software, etc.).
- [ ] Desarrollar la función de evaluación que calcule la Distancia del Coseno entre una pregunta de prueba y los Vectores Ancla.
- [ ] Exportar la configuración del modelo y el tokenizador para su uso en el entorno de producción.

## ✅ Criterios de Aceptación
- El script de pruebas clasifica correctamente al menos 10 preguntas de prueba sin usar reglas `IF/ELSE` estáticas, basándose puramente en la similitud espacial.