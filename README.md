# Tutor CENEVAL — Plataforma de Diagnóstico con IA

Este proyecto es una plataforma web completa (Backend + Frontend) que funciona como un Tutor Inteligente diseñado para diagnosticar y predecir la probabilidad de éxito de estudiantes universitarios en el examen CENEVAL, utilizando un modelo de Machine Learning entrenado con Random Forest.

## Arquitectura del Sistema

El proyecto sigue una arquitectura cliente-servidor, separando el frontend y el backend en servicios independientes que se comunican mediante una API REST con peticiones en formato JSON.

* **Frontend:** React 19 + Vite 7 (puerto 5173)
* **Backend / API:** FastAPI — Python 3.10 (puerto 8000)
* **Base de Datos:** PostgreSQL (puerto 5432)
* **ORM:** SQLAlchemy (con validación de esquemas vía Pydantic)
* **Motor de IA:** Scikit-Learn y XGBoost (Random Forest v2)
* **Infraestructura:** Docker y Docker Compose
* **Seguridad:** JWT (JSON Web Tokens) y hashing de contraseñas con passlib (bcrypt)
* **Comunicación:** CORS habilitado para permitir la interacción entre frontend y backend en puertos distintos

## Estructura del Proyecto

```
Ceneval-Tutor/
│
├── backend/                   # API HTTP y lógica de negocio
│   ├── app/
│   │   ├── core/              # Configuración y seguridad (JWT, hashing)
│   │   ├── ml/                # Modelos de ML exportados (.pkl)
│   │   ├── models/            # Modelos de BD relacional (SQLAlchemy)
│   │   ├── schemas/           # Contratos de datos y validación (Pydantic)
│   │   ├── services/          # Lógica central (usuarios, exámenes, diagnóstico)
│   │   ├── api/               # Dependencias de inyección (auth, DB sessions)
│   │   ├── database.py        # Configuración de conexión a PostgreSQL
│   │   └── main.py            # Punto de entrada de la API (FastAPI)
│   ├── scripts/               # Scripts de automatización
│   │   └── data/              # Banco de preguntas CENEVAL (JSON)
│   ├── Dockerfile             # Imagen Docker del backend
│   └── requirements.txt       # Dependencias de Python
│
├── frontend/                  # Interfaz de usuario (React)
│   ├── src/
│   │   ├── components/layout/ # Componentes de layout (Sidebar, TopBar, AppShell)
│   │   ├── context/           # Estado global de autenticación (AuthContext)
│   │   ├── pages/
│   │   │   ├── LoginPage/     # Página de login y registro
│   │   │   ├── DashboardPage/ # Panel principal con métricas e insights
│   │   │   ├── ExamPage/      # Examen diagnóstico con tracking automático
│   │   │   └── ResultsPage/   # Resultados con predicción de IA
│   │   ├── services/          # Capa de comunicación con la API (api.js)
│   │   ├── App.jsx            # Rutas y navegación
│   │   ├── main.jsx           # Punto de entrada de React
│   │   └── index.css          # Sistema de diseño global (tema oscuro)
│   ├── index.html             # HTML base
│   └── package.json           # Dependencias de Node.js
│
├── data_science/              # Laboratorio de IA y análisis de datos
│   ├── data/                  # Conjuntos de datos simulados
│   ├── models/                # Modelos entrenados almacenados
│   └── src/                   # Scripts de entrenamiento y evaluación
│
├── docker-compose.yml         # Orquestación de servicios (DB + API)
├── .env                       # Variables de entorno (DB, JWT)
└── README.md
```

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
