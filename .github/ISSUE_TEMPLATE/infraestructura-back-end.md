---
title: "[FEAT] Infraestructura Backend para Búsqueda Semántica (pgvector)"
labels: ["backend", "database", "architecture"]
---
## 🎯 Objetivo Arquitectónico
Trasladar la lógica del modelo NLP al servidor de FastAPI e integrar el motor de base de datos relacional con capacidades vectoriales para evitar cuellos de botella en la memoria RAM.

## 📋 Tareas
- [ ] Modificar `docker-compose.yml` para instanciar PostgreSQL con la extensión `pgvector`.
- [ ] Actualizar el ORM (SQLAlchemy): Modificar el esquema `Question` para incluir una columna `Vector(768)`.
- [ ] Crear `NLPService` usando el **Patrón Singleton** para cargar el modelo Transformer al arrancar FastAPI (`startup event`).
- [ ] Crear el endpoint `POST /preguntas/clasificar` que ingiera texto plano, solicite el embedding a `NLPService` y use una consulta SQL espacial para guardar la pregunta en la categoría más cercana.

## ✅ Criterios de Aceptación
- La extensión `vector` existe en la base de datos de Docker.
- FastAPI no colapsa por falta de RAM al levantar el contenedor.
- Se pueden hacer peticiones HTTP al endpoint y la pregunta se guarda correctamente clasificada en PostgreSQL.