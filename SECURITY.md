# Política de Seguridad (Security Policy)

La seguridad es una prioridad fundamental en la arquitectura de **Ceneval-Tutor**. Este documento describe nuestras prácticas de seguridad, las versiones soportadas y el proceso para reportar vulnerabilidades.

## Versiones Soportadas

Actualmente, solo la rama principal (`main`) recibe actualizaciones de seguridad y parches. 

| Versión | Soportada          | Notas                                      |
| ------- | ------------------ | ------------------------------------------ |
| `main`  | :white_check_mark: | Rama activa de desarrollo y producción local |
| `< 1.0` | :x:                | Versiones alfa/beta depreciadas            |

## Reportar una Vulnerabilidad

**Por favor, NO abras un "Issue" público en GitHub para reportar vulnerabilidades de seguridad.** Hacerlo expone la vulnerabilidad a atacantes antes de que podamos parchearla. Si descubres un problema de seguridad en el backend (FastAPI), frontend (React), bases de datos o en los modelos de Machine Learning, por favor repórtalo de manera privada:

1. Envía un correo electrónico a: **mario152003@gmail.com**
2. Incluye en el asunto: `[VULNERABILIDAD] - Ceneval-Tutor`
3. Proporciona una descripción detallada del problema, los pasos para reproducirlo y, si es posible, una sugerencia de mitigación a nivel de arquitectura.

Nos comprometemos a  proporcionar actualizaciones sobre la resolución del problema.

---

## Arquitectura de Seguridad del Proyecto

Para los desarrolladores y contribuidores que interactúan con este repositorio, estas son las reglas estrictas de seguridad de nuestra arquitectura:

### 1. Gestión de Secretos y Credenciales
* **Prohibido versionar secretos:** Ningún archivo `.env`, llaves de API, tokens JWT (`JWT_SECRET_KEY`) o contraseñas de bases de datos de PostgreSQL deben ser comiteados en este repositorio.
* **Uso de Gitignore:** El archivo `.gitignore` está estrictamente configurado para bloquear la subida de archivos de entorno local.

### 2. Seguridad en Modelos de Inteligencia Artificial (MLSec)
* **Archivos Binarios (Pickle / PyTorch):** Este proyecto utiliza modelos serializados (`.pt`, `.pkl`). Por razones de seguridad (evitar ejecución de código arbitrario), los modelos preentrenados grandes no se versionan en Git. Deben cargarse desde fuentes confiables o generarse localmente a través de los pipelines de entrenamiento proporcionados en `data_science/src/`.
* **Inferencia Aislada:** La ejecución de los modelos (inyección de tensores) se realiza de manera aislada dentro del contenedor Docker del backend (`ceneval_api`) para proteger el sistema host.

### 3. Autenticación y API (FastAPI)
* Los endpoints del backend están protegidos mediante **JWT (JSON Web Tokens)**. 
* El algoritmo de firma criptográfica utilizado es `HS256`. 
* La política de CORS (Cross-Origin Resource Sharing) está configurada para permitir comunicación únicamente con los orígenes autorizados del frontend, previniendo ataques CSRF.

### 4. Escaneo de Dependencias
Mantenemos la integridad de nuestro código de terceros utilizando herramientas de análisis estático. Cualquier alerta crítica o moderada reportada por **Dependabot** (tanto en el `requirements.txt` de Python como en el `package.json` de Node.js) debe ser atendida, probada y parcheada en el siguiente ciclo de desarrollo.