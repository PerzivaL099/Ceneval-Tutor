# Tutor CENEVAL - Backend & AI Engine 

Este proyecto es el motor de backend y Machine Learning para un Tutor Inteligente diseñado para diagnosticar y predecir la probabilidad de éxito de estudiantes universitarios en exámenes estandarizados.

##  Arquitectura del Sistema

El proyecto sigue una arquitectura monolítica modularizada, separando claramente las responsabilidades en capas:

* **Framework Web:** FastAPI (Python 3.10)
* **Base de Datos:** PostgreSQL
* **ORM:** SQLAlchemy (con modelos y esquemas validados vía Pydantic)
* **Motor de Inteligencia Artificial:** Scikit-Learn y XGBoost (Random Forest v2)
* **Infraestructura:** Docker & Docker Compose
* **Seguridad:** JWT (JSON Web Tokens) y hashing de contraseñas con passlib (bcrypt).

##  Estructura del Proyecto

El repositorio está dividido en dos grandes ecosistemas:

├── backend/               # La API HTTP y lógica de negocio
│   ├── app/               # Código fuente principal de FastAPI
│   │   ├── ml/            # Modelos de Machine Learning exportados (.pkl)
│   │   ├── models/        # Modelos de base de datos relacional (SQLAlchemy)
│   │   ├── schemas/       # Contratos de datos y validación (Pydantic)
│   │   ├── services/      # Lógica central (Controladores y procesamiento)
│   │   └── main.py        # Punto de entrada de la aplicación
│   └── scripts/           # Scripts de automatización (ej. inyección de datos)
│
└── data_science/          # Laboratorio de IA y análisis de datos
    ├── data/              # Conjuntos de datos simulados y estructurados
    ├── models/            # Almacenamiento de modelos entrenados
    └── src/               # Scripts de entrenamiento y evaluación de algoritmos

##  Instalación y Despliegue (Entorno Local)

### Prerrequisitos
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución.
* Git.

### Pasos para levantar el entorno

1.  **Clonar el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd Ceneval-Tutor
    ```

2.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz del directorio `backend/` basado en el `.env.example` (si aplica) con tus credenciales de PostgreSQL y JWT.

3.  **Construir y levantar la infraestructura:**
    Ejecuta el siguiente comando para levantar la base de datos y la API:
    ```bash
    docker-compose up --build
    ```
    *La API estará disponible en `http://localhost:8000` y la documentación interactiva en `http://localhost:8000/docs`.*

##  Poblado de Base de Datos (Seed)

Para que el sistema funcione correctamente y el motor de IA tenga contexto, necesitas inyectar el "Banco Estable de Preguntas".

Con el contenedor ejecutándose, abre otra terminal y corre:
```bash
docker exec -it ceneval_api python scripts/seed_db.py