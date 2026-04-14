---
name: "✨ Feature: Motor Semántico (Embeddings NLP)"
about: "Implementación de Deep Learning para categorización automática del banco de preguntas."
title: "[FEAT] Motor de Embeddings y Búsqueda Semántica para Preguntas"
labels: ["enhancement", "deep-learning", "backend", "database"]
assignees: ''
---

## 🎯 Objetivo Arquitectónico
Sustituir la catalogación manual de las preguntas del CENEVAL por un sistema de **Deep Representation Learning**. Utilizaremos un modelo Transformer para convertir el texto de las preguntas en vectores multidimensionales (embeddings) y calcularemos su similitud geométrica contra nuestras categorías base.

## 🏗️ Arquitectura y Tecnologías
- **NLP / Deep Learning:** Modelo Transformer ligero (ej. `sentence-transformers`).
- **Base de Datos:** PostgreSQL con la extensión `pgvector`.
- **Backend:** FastAPI + SQLAlchemy.
- **Métrica de Decisión:** Similitud del Coseno.

---

## 📋 Lista de Tareas (Roadmap de Implementación)

### 🔬 Fase 1: Data Science & NLP (Laboratorio)
- [ ] Investigar y seleccionar el modelo preentrenado de Hugging Face óptimo para español.
- [ ] Crear script de prueba para generar los vectores "Ancla" (Centros de gravedad) de cada categoría del CENEVAL (Redes, Software, BD, etc.).
- [ ] Validar localmente que el cálculo de Similitud del Coseno entre los anclajes y una pregunta de prueba tenga sentido lógico.

### 🗄️ Fase 2: Infraestructura de Base de Datos
- [ ] Modificar el archivo `docker-compose.yml` para usar una imagen de PostgreSQL que incluya `pgvector` (ej. `pgvector/pgvector:pg16`).
- [ ] Actualizar `database.py` y correr el comando SQL `CREATE EXTENSION IF NOT EXISTS vector;` al inicializar la BD.
- [ ] Actualizar el modelo `Question` en SQLAlchemy (`app/models/question.py`) para incluir una columna tipo `Vector(768)`.

### ⚙️ Fase 3: Integración en el Backend (FastAPI)
- [ ] Crear un nuevo servicio (`app/services/nlp_service.py`) que implemente el patrón Singleton para cargar el Transformer en RAM al arrancar el servidor.
- [ ] Actualizar el endpoint `POST /preguntas/` para que:
  1. Reciba el texto en plano.
  2. Llame al `nlp_service` para generar el embedding.
  3. Ejecute la consulta espacial en PostgreSQL ordenando por similitud del coseno.
  4. Asigne la categoría ganadora y guarde el registro en la base de datos.

---

## ✅ Criterios de Aceptación (Definition of Done)
- [ ] La base de datos levanta correctamente en Docker con la extensión `pgvector` activada.
- [ ] El contenedor de FastAPI no excede la memoria RAM límite al cargar el modelo de NLP.
- [ ] Al hacer un POST con una pregunta de prueba nueva (ej. "Diferencia entre JOIN y LEFT JOIN"), el sistema la clasifica automáticamente en "Bases de Datos" sin intervención humana.
- [ ] El modelo SQLAlchemy serializa y deserializa los vectores correctamente sin romper el esquema de Pydantic.

## 📝 Notas Adicionales
*(Agrega aquí cualquier link a la documentación de Hugging Face, pgvector, o dependencias extras que se deban agregar al `requirements.txt` como `torch` o `sentence-transformers`)*