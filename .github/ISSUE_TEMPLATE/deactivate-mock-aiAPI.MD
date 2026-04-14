---
name: "🐛 Bug/Refactor: Desactivar Mock Mode e Integrar API Real"
about: "Transición del entorno simulado (Mock) a la conexión real con FastAPI y el modelo Random Forest."
title: "[REFACTOR] Conectar Frontend con Backend Real (Desactivar MOCK_MODE)"
labels: ["bug", "frontend", "integration", "api"]
assignees: ''
---

## 🎯 Objetivo Arquitectónico
Actualmente, el servicio de API del frontend (`api.js`) está operando en un entorno de simulación (`MOCK_MODE = true`). Esto significa que el inicio de sesión, la carga del banco de preguntas y, lo más crítico, la predicción de éxito del alumno, se están calculando mediante una ecuación lineal estática en el navegador en lugar de consultar nuestro modelo **Random Forest** alojado en FastAPI. 

El objetivo es apagar esta simulación y establecer el flujo de datos real cliente-servidor mediante peticiones HTTP.

## 🏗️ Arquitectura y Flujo Esperado
1. **Autenticación:** El frontend debe solicitar un JWT real a `/login` y almacenarlo de forma segura.
2. **Carga de Datos:** El banco de preguntas debe consumirse desde la base de datos PostgreSQL mediante el endpoint `/exams/`.
3. **Inferencia de IA:** La función `getDiagnostic` debe enviar el payload JSON al endpoint real `/diagnostico/` para que el modelo `.pkl` en RAM realice la predicción en milisegundos.

---

## 📋 Lista de Tareas (Roadmap de Integración)

### ⚙️ Fase 1: Configuración de Entorno
- [ ] Cambiar la constante `MOCK_MODE` a `false` en el archivo de servicios de la API.
- [ ] Verificar que la constante `API_BASE` apunte correctamente al puerto de Docker (`http://localhost:8000`).
- [ ] Crear un archivo `.env.local` en el frontend si es necesario para manejar la URL de la API mediante variables de entorno (ej. `VITE_API_URL`).

### 🔌 Fase 2: Pruebas de Endpoints
- [ ] **Autenticación:** Probar el flujo de `loginUser` y `registerUser`. Asegurar que el token devuelto no sea el mock (`mock_jwt_token_ceneval_ai`), sino un JWT real firmado por FastAPI, y que las cabeceras `Authorization: Bearer` se adjunten en peticiones subsecuentes.
- [ ] **Exámenes:** Validar que `getExams()` traiga las preguntas inyectadas previamente en la base de datos (mediante el script `seed_db.py`).

### 🧠 Fase 3: Integración del Motor Diagnóstico
- [ ] Probar la función `getDiagnostic(diagnosticData)`.
- [ ] Eliminar o comentar la función temporal `mockPredict(data)` para limpiar el código de producción.
- [ ] Validar que la estructura de respuesta del endpoint `/diagnostico/` coincida con lo que el componente de React (`ResultsPage.jsx`) espera recibir para graficar.

---

## ✅ Criterios de Aceptación (Definition of Done)
- [ ] Al iniciar sesión en la interfaz, se puede ver un token JWT real en el *Local Storage* del navegador.
- [ ] Los contenedores de Docker registran actividad (logs de `200 OK`) cuando el usuario interactúa con la aplicación de React.
- [ ] El diagnóstico final es generado por el modelo de Scikit-Learn en el backend y no por la función simulada del frontend.
- [ ] No existen errores de **CORS** en la consola del navegador al intentar comunicarse con el puerto 8000.

## 📝 Notas Adicionales
Si ocurren problemas de CORS al desactivar el Mock Mode, revisar que el middleware de `CORSMiddleware` en `backend/app/main.py` tenga habilitado el origen `http://localhost:5173`.