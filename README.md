# Tutor CENEVAL — Plataforma de Diagnóstico con IA

Este proyecto es una plataforma web completa (Backend + Frontend) que ha transitado de un sistema de evaluación estático basado en Random Forest hacia un verdadero Sistema Tutor Inteligente (ITS). Está diseñado para diagnosticar y preparar a estudiantes universitarios para el examen EGEL-C en Ingeniería en Ciencias Computacionales, utilizando un modelo de diagnóstico (Random Forest) y un nuevo Motor Semántico de Deep Learning (BERT-CNN) para la clasificación automática de temas.

## Arquitectura del Sistema

El proyecto sigue una arquitectura cliente-servidor, separando el frontend y el backend en servicios independientes que se comunican mediante una API REST. La integración del modelo de lenguaje permite inferencia local sin depender de llamadas externas.

* **Frontend:** React + Vite (SPA, React Router v6) con un tema dark personalizado.
* **Backend / API:** FastAPI — Python 3.x, Uvicorn.
* **Base de Datos:** PostgreSQL (SQLAlchemy ORM).
* **Motor de IA Diagnóstico:** Scikit-Learn y XGBoost (Random Forest v2).
* **Motor de IA Semántico (Deep Learning):** PyTorch y Hugging Face Transformers (AutoTokenizer + AutoModel).
* **Infraestructura:** Docker Compose (Contenedores backend + BD).
* **Entrenamiento ML:** Cómputo ejecutado en Google Colab con GPU NVIDIA T4.

## Motor Semántico NLP (Fase 5)

La plataforma integra un motor de Deep Learning basado en la arquitectura **BERT-CNN**, seleccionado por su alta capacidad de generalización. Su función es clasificar automáticamente cualquier pregunta ingresada por el estudiante en una de las cuatro áreas temáticas del EGEL-C:

* **Clase 0:** Algoritmia y Estructuras de Datos.
* **Clase 1:** Arquitectura de Computadoras y Sistemas.
* **Clase 2:** Ingeniería de Software, Bases de Datos y Ciberseguridad.
* **Clase 3:** Computación Inteligente y Sistemas Distribuidos.

**Características del Modelo:**
* **Backbone:** Utiliza el tokenizador y modelo base `dccuchile/bert-base-spanish-wwm-uncased` (BETO).
* **Rendimiento:** El modelo alcanzó un F1-Score Macro de **0.78** en el conjunto de prueba.
* **Regla de Negocio (Fuera de Dominio):** El sistema exige un umbral de confianza mínimo del 60% para clasificar una pregunta como válida. Por debajo de este valor, la API retorna de manera segura `fuera_de_dominio: true`.

Estimado profesor,

Debido a las mejores prácticas de MLOps y a los límites de tamaño de archivo 
de GitHub (que bloquea archivos mayores a 100MB), los pesos del modelo de 
Inteligencia Artificial no se encuentran versionados en el repositorio principal.

Para poder ejecutar la API y probar la funcionalidad del Tutor Inteligente, 
es estrictamente necesario integrar este modelo en el proyecto antes de 
levantar los contenedores de Docker.

Por favor, siga estos pasos:

1. Descargue el archivo comprimido "modelo_exportado.zip" adjunto en esta 
   entrega de Blackboard.
2. Extraiga el contenido del archivo .zip.
3. Mueva la carpeta extraída hacia la siguiente ruta exacta dentro del 
   repositorio que acaba de clonar:
   
   Ceneval-Tutor/data_science/modelo_exportado/

Para que el contenedor de FastAPI pueda montar el volumen correctamente, 
la estructura interna de carpetas debe quedar exactamente así:

   Ceneval-Tutor/
   └── data_science/
       └── modelo_exportado/
           ├── pesos_bert_cnn.pt
           ├── metadatos.json
           └── tokenizador/

Una vez que la carpeta "modelo_exportado" y sus archivos estén en esa 
ubicación, puede proceder con normalidad a levantar el proyecto ejecutando 
el comando en la raíz del repositorio: 

docker compose up --build

## Estructura del Proyecto

```text
Ceneval-Tutor/
│
├── backend/                   # API HTTP y lógica de negocio
│   ├── app/
│   │   ├── core/              # Configuración y seguridad (JWT, hashing)
│   │   ├── ml/                # Modelos clásicos de ML exportados (.pkl)
│   │   ├── models/            # Modelos de BD relacional (SQLAlchemy)
│   │   ├── schemas/           # Contratos de datos y validación (Pydantic)
│   │   ├── services/          # Lógica central (usuarios, NLP, diagnóstico)
│   │   ├── api/               # Dependencias de inyección
│   │   ├── database.py        # Configuración de conexión a PostgreSQL
│   │   └── main.py            # Punto de entrada de la API (FastAPI)
│   ├── Dockerfile             # Imagen Docker del backend
│   └── requirements.txt       # Dependencias de Python
│
├── frontend/                  # Interfaz de usuario (React)
│   ├── src/
│   │   ├── components/layout/ # Componentes de layout (Sidebar, TopBar)
│   │   ├── pages/             # Vistas principales (Dashboard, Clasificador IA, etc.)
│   │   ├── services/          # Capa de comunicación HTTP con la API
│   │   └── App.jsx            # Rutas y navegación
│   └── package.json           # Dependencias de Node.js
│
├── data_science/              # Laboratorio de IA y análisis de datos
│   ├── data/                  # Conjuntos de datos simulados y aumentados
│   ├── modelo_exportado/      # Artefactos del modelo BERT-CNN serializados
│   │   ├── pesos_bert_cnn.pt  # Pesos fine-tuneados (state_dict de PyTorch)
│   │   ├── tokenizador/       # Directorio con el tokenizador BETO
│   │   └── metadatos.json     # Mapa de etiquetas y configuración
│   └── src/                   # Scripts de entrenamiento y evaluación
│
├── docker-compose.yml         # Orquestación de servicios (DB + API)
├── .env                       # Variables de entorno (DB, JWT)
└── README.md

## Prerrequisitos

* [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución.
* [Node.js](https://nodejs.org/) (v18 o superior) con npm.
* Git.

## Instalación y Despliegue (Entorno Local)

### 1. Clonar el repositorio

```bash
git clone https://github.com/PerzivaL099/Ceneval-Tutor.git
cd Ceneval-Tutor
```

### 2. Configurar variables de entorno

Verifica que exista un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
POSTGRES_USER=ceneval_user
POSTGRES_PASSWORD=ceneval_pass
POSTGRES_DB=ceneval_db
POSTGRES_HOST=db
POSTGRES_PORT=5432

JWT_SECRET_KEY=tu_clave_secreta
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60
```

### 3. Levantar el Backend (Docker)

Construye y levanta la base de datos PostgreSQL y la API de FastAPI:

```bash
docker compose up --build
```

> Si usas una versión anterior de Docker, utiliza `docker-compose up --build`.

La API estará disponible en:
* **API:** `http://localhost:8000`
* **Documentación interactiva (Swagger):** `http://localhost:8000/docs`

### 4. Poblar la Base de Datos (Seed)

Con los contenedores ejecutándose, abre otra terminal y ejecuta:

```bash
docker exec -it ceneval_api python scripts/seed_db.py
```

Esto inyecta el banco de 30 preguntas CENEVAL en la base de datos y crea el examen diagnóstico base.

### 5. Instalar dependencias del Frontend

```bash
cd frontend
npm install
```

### 6. Iniciar el Frontend

```bash
npm run dev
```

El frontend estará disponible en:
* **Aplicación:** `http://localhost:5173`

