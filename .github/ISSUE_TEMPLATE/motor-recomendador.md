---
name: "🤖 Feature: Motor Recomendador (Autoencoders)"
about: "Implementación de IA para perfilar usuarios y sugerir temas."
title: "[FEAT] Motor Recomendador: Autoencoders y Perfilado"
labels: ["deep-learning", "data-science", "recommender"]
assignees: ''
---
## 🎯 Objetivo Arquitectónico
Complementar el DAG estricto con recomendaciones personalizadas impulsadas por IA. El sistema debe comprimir el perfil del alumno en un espacio latente para encontrar rutas de estudio óptimas basadas en patrones ocultos.

## 📋 Tareas
- [ ] Diseñar el "Vector de Identidad" del alumno (matriz con métricas de desempeño por cada nodo del grafo).
- [ ] Construir la arquitectura de red neuronal profunda (**Autoencoder**): Capas de Encoding para comprimir el perfil y Decoding para la reconstrucción.
- [ ] Entrenar el modelo con el dataset sintético para capturar las correlaciones entre fallos (ej. quienes fallan en X también fallan en Y).
- [ ] Implementar la capa de **Filtrado Colaborativo**: Buscar perfiles similares en el espacio latente y extraer el tema que mejoró sus probabilidades de éxito.
- [ ] Enlazar este output al endpoint `/diagnostico/` para retornar el arreglo `recomendaciones_estudio`.

## ✅ Criterios de Aceptación
- El modelo logra comprimir y descomprimir vectores de alumnos con un error (MSE) aceptable.
- El endpoint retorna sugerencias de estudio específicas además de la probabilidad binaria de aprobación.