---
title: "[FEAT] Modelado de Dependencias: Grafo de Conocimiento (DAG)"
labels: ["backend", "algorithms", "logic"]
---
## 🎯 Objetivo Arquitectónico
Dejar de tratar los temas de estudio como listas planas y modelarlos como una red relacional. Construiremos un Grafo Acíclico Dirigido (DAG) en el servidor para establecer los prerrequisitos lógicos de aprendizaje.

## 📋 Tareas
- [ ] Implementar la librería `NetworkX` en FastAPI para modelar la estructura del temario.
- [ ] Definir los Nodos (Subtemas) y las Aristas Dirigidas (Prerrequisitos). Ej: `Recursividad -> QuickSort`.
- [ ] Desarrollar el servicio `KnowledgeTracingService` que analice el historial de respuestas del alumno en la BD.
- [ ] Crear el algoritmo de evaluación de estados: Asignar color dinámico a cada nodo (Verde: Dominado, Rojo: Por mejorar, Gris: Bloqueado) iterando sobre el DAG.
- [ ] Exponer el endpoint `GET /alumno/{id}/grafo-habilidades` que retorne el DAG serializado en JSON.

## ✅ Criterios de Aceptación
- El endpoint retorna un JSON estructurado con nodos y vínculos.
- La lógica del servidor impide que un nodo avanzado (ej. Normalización BCNF) esté "Verde" si el nodo padre (ej. Primera Forma Normal) está "Rojo".