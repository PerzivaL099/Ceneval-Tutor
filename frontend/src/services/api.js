// ============================================================
// API Service — with MOCK MODE fallback
// ============================================================

const API_BASE = 'http://localhost:8000';

// Set to true to bypass the backend entirely
const MOCK_MODE = false;

// ---- Mock Data ----
const MOCK_USER = {
  id: 1,
  email: 'alumno@ceneval.mx',
  is_active: true,
};

const MOCK_PASSWORD = '1234';

const MOCK_QUESTIONS = [
  { id: 1, text: "Durante la fase de análisis léxico, ¿qué estructura de datos se utiliza para reconocer tokens?", option_a: "ABB", option_b: "AFD", option_c: "Hash", option_d: "DAG", correct_answer: "b", category: "Teoría de Compiladores", difficulty: 0.8, exam_id: 1 },
  { id: 2, text: "¿Qué operador introduce diversidad en Algoritmos Genéticos?", option_a: "Cruce", option_b: "Selección", option_c: "Mutación", option_d: "Elitismo", correct_answer: "c", category: "Computación Evolutiva", difficulty: 0.7, exam_id: 1 },
  { id: 3, text: "¿Qué patrón asegura una única instancia global?", option_a: "Factory", option_b: "Observer", option_c: "Singleton", option_d: "Decorator", correct_answer: "c", category: "Ingeniería de Software", difficulty: 0.3, exam_id: 1 },
  { id: 4, text: "¿Cuál es la complejidad temporal promedio de Quicksort?", option_a: "O(n)", option_b: "O(n log n)", option_c: "O(n²)", option_d: "O(log n)", correct_answer: "b", category: "Lógica y Algoritmos", difficulty: 0.5, exam_id: 1 },
  { id: 5, text: "En SQL, ¿qué comando elimina todos los registros de una tabla sin borrar la estructura?", option_a: "DELETE", option_b: "DROP", option_c: "TRUNCATE", option_d: "REMOVE", correct_answer: "c", category: "Bases de Datos", difficulty: 0.4, exam_id: 1 },
  { id: 6, text: "¿Qué capa del modelo OSI se encarga del enrutamiento lógico y direccionamiento IP?", option_a: "Física", option_b: "Enlace", option_c: "Red", option_d: "Transporte", correct_answer: "c", category: "Redes", difficulty: 0.4, exam_id: 1 },
  { id: 7, text: "¿Cuál es el resultado de la integral de 2x dx?", option_a: "x² + C", option_b: "2x² + C", option_c: "x + C", option_d: "2 + C", correct_answer: "a", category: "Matemáticas", difficulty: 0.3, exam_id: 1 },
  { id: 8, text: "En Scrum, ¿quién es el responsable de priorizar el Product Backlog?", option_a: "Scrum Master", option_b: "Team", option_c: "Product Owner", option_d: "Stakeholder", correct_answer: "c", category: "Ingeniería de Software", difficulty: 0.4, exam_id: 1 },
  { id: 9, text: "¿Qué protocolo se utiliza para asignar direcciones IP dinámicamente?", option_a: "DNS", option_b: "HTTP", option_c: "DHCP", option_d: "SMTP", correct_answer: "c", category: "Redes", difficulty: 0.3, exam_id: 1 },
  { id: 10, text: "Propiedad de BD que garantiza que una transacción se complete totalmente o no se haga nada:", option_a: "Aislamiento", option_b: "Atomicidad", option_c: "Consistencia", option_d: "Durabilidad", correct_answer: "b", category: "Bases de Datos", difficulty: 0.6, exam_id: 1 },
  { id: 11, text: "¿Qué tipo de búsqueda es más eficiente en un arreglo ordenado?", option_a: "Lineal", option_b: "Binaria", option_c: "Profundidad", option_d: "Anchura", correct_answer: "b", category: "Lógica y Algoritmos", difficulty: 0.4, exam_id: 1 },
  { id: 12, text: "¿Cuál de estos es un lenguaje libre de contexto?", option_a: "aⁿbⁿ", option_b: "aⁿbⁿcⁿ", option_c: "Lenguaje Regular", option_d: "Ninguno", correct_answer: "a", category: "Teoría de Compiladores", difficulty: 0.9, exam_id: 1 },
  { id: 13, text: "En POO, ¿qué concepto permite a una clase hija heredar métodos de una padre?", option_a: "Polimorfismo", option_b: "Encapsulamiento", option_c: "Herencia", option_d: "Abstracción", correct_answer: "c", category: "Ingeniería de Software", difficulty: 0.2, exam_id: 1 },
  { id: 14, text: "¿Qué puerto utiliza por defecto el protocolo HTTPS?", option_a: "80", option_b: "21", option_c: "443", option_d: "8080", correct_answer: "c", category: "Redes", difficulty: 0.2, exam_id: 1 },
  { id: 15, text: "Si un proceso 'A' espera a 'B' y 'B' espera a 'A', se produce un:", option_a: "Starvation", option_b: "Deadlock", option_c: "Race Condition", option_d: "Mutex", correct_answer: "b", category: "Lógica y Algoritmos", difficulty: 0.7, exam_id: 1 },
  { id: 16, text: "¿Cuál es la derivada de sin(x)?", option_a: "cos(x)", option_b: "-cos(x)", option_c: "tan(x)", option_d: "sin(x)cos(x)", correct_answer: "a", category: "Matemáticas", difficulty: 0.5, exam_id: 1 },
  { id: 17, text: "Tipo de JOIN que devuelve solo los registros con coincidencias en ambas tablas:", option_a: "LEFT JOIN", option_b: "OUTER JOIN", option_c: "INNER JOIN", option_d: "CROSS JOIN", correct_answer: "c", category: "Bases de Datos", difficulty: 0.4, exam_id: 1 },
  { id: 18, text: "¿Qué algoritmo busca el camino más corto en un grafo con pesos no negativos?", option_a: "Prim", option_b: "Dijkstra", option_c: "Kruskal", option_d: "DFS", correct_answer: "b", category: "Lógica y Algoritmos", difficulty: 0.8, exam_id: 1 },
  { id: 19, text: "En Docker, ¿qué comando crea una imagen a partir de un Dockerfile?", option_a: "run", option_b: "push", option_c: "build", option_d: "pull", correct_answer: "c", category: "Ingeniería de Software", difficulty: 0.5, exam_id: 1 },
  { id: 20, text: "¿Cuál es la máscara de subred por defecto para una clase C?", option_a: "255.0.0.0", option_b: "255.255.0.0", option_c: "255.255.255.0", option_d: "0.0.0.0", correct_answer: "c", category: "Redes", difficulty: 0.4, exam_id: 1 },
  { id: 21, text: "Normalización de BD que elimina dependencias transitivas:", option_a: "1NF", option_b: "2NF", option_c: "3NF", option_d: "BCNF", correct_answer: "c", category: "Bases de Datos", difficulty: 0.8, exam_id: 1 },
  { id: 22, text: "¿Qué componente de un compilador genera el código intermedio?", option_a: "Lexer", option_b: "Parser", option_c: "Generador de código", option_d: "Analizador Semántico", correct_answer: "c", category: "Teoría de Compiladores", difficulty: 0.7, exam_id: 1 },
  { id: 23, text: "En probabilidad, ¿cuál es el espacio muestral de lanzar una moneda dos veces?", option_a: "2", option_b: "4", option_c: "8", option_d: "1", correct_answer: "b", category: "Matemáticas", difficulty: 0.3, exam_id: 1 },
  { id: 24, text: "¿Cuál es la base del sistema hexadecimal?", option_a: "2", option_b: "8", option_c: "16", option_d: "10", correct_answer: "c", category: "Lógica y Algoritmos", difficulty: 0.2, exam_id: 1 },
  { id: 25, text: "Metodología de desarrollo que utiliza 'Sprints':", option_a: "Cascada", option_b: "Espiral", option_c: "Agile/Scrum", option_d: "V-Model", correct_answer: "c", category: "Ingeniería de Software", difficulty: 0.3, exam_id: 1 },
  { id: 26, text: "¿Qué etiqueta HTML se usa para insertar un salto de línea?", option_a: "<lb>", option_b: "<break>", option_c: "<br>", option_d: "<p>", correct_answer: "c", category: "Ingeniería de Software", difficulty: 0.1, exam_id: 1 },
  { id: 27, text: "¿Qué comando de Git se usa para subir cambios al repositorio remoto?", option_a: "commit", option_b: "add", option_c: "push", option_d: "fetch", correct_answer: "c", category: "Ingeniería de Software", difficulty: 0.2, exam_id: 1 },
  { id: 28, text: "Unidad mínima de almacenamiento en una base de datos relacional:", option_a: "Tabla", option_b: "Fila/Registro", option_c: "Campo", option_d: "Base de datos", correct_answer: "c", category: "Bases de Datos", difficulty: 0.2, exam_id: 1 },
  { id: 29, text: "¿Cuál es la suma de los ángulos internos de un triángulo?", option_a: "90", option_b: "360", option_c: "180", option_d: "270", correct_answer: "c", category: "Matemáticas", difficulty: 0.2, exam_id: 1 },
  { id: 30, text: "Protocolo para envío de correos electrónicos:", option_a: "POP3", option_b: "IMAP", option_c: "SMTP", option_d: "FTP", correct_answer: "c", category: "Redes", difficulty: 0.4, exam_id: 1 },
];

// ---- Helper ----
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Error de conexión' }));
    throw new Error(error.detail || 'Error del servidor');
  }

  return res.json();
}

// ---- Auth ----
export async function registerUser(email, password) {
  if (MOCK_MODE) {
    // In mock mode, just return the mock user
    return { ...MOCK_USER, email };
  }
  return request('/users/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function loginUser(email, password) {
  if (MOCK_MODE) {
    // Validate mock credentials
    if (email === MOCK_USER.email && password === MOCK_PASSWORD) {
      localStorage.setItem('token', 'mock_jwt_token_ceneval_ai');
      localStorage.setItem('mockUser', JSON.stringify({ ...MOCK_USER, email }));
      return { access_token: 'mock_jwt_token_ceneval_ai', token_type: 'bearer' };
    }
    throw new Error('Email o contraseña incorrectos');
  }

  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username: email, password }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Error de conexión' }));
    throw new Error(error.detail || 'Credenciales inválidas');
  }

  const data = await res.json();
  localStorage.setItem('token', data.access_token);
  return data;
}

export async function getCurrentUser() {
  if (MOCK_MODE) {
    const stored = localStorage.getItem('mockUser');
    if (stored) return JSON.parse(stored);
    return MOCK_USER;
  }
  return request('/users/me');
}

export function logoutUser() {
  localStorage.removeItem('token');
  localStorage.removeItem('mockUser');
}

export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

// ---- Exams & Questions ----
export async function getExams() {
  if (MOCK_MODE) {
    // Simulate a small delay
    await new Promise((r) => setTimeout(r, 500));
    return [
      {
        id: 1,
        title: 'CENEVAL Diagnóstico Global',
        description: 'Examen base para el motor de Machine Learning',
        questions: MOCK_QUESTIONS,
      },
    ];
  }
  return request('/exams/');
}

// ---- Diagnostic (ML Prediction) ----
export async function getDiagnostic(diagnosticData) {
  if (MOCK_MODE) {
    // Simulate the ML model prediction locally
    await new Promise((r) => setTimeout(r, 1500));
    return mockPredict(diagnosticData);
  }
  return request('/diagnostico/', {
    method: 'POST',
    body: JSON.stringify(diagnosticData),
  });
}

// ---- Local ML Simulation ----
// Replicates the scoring logic from train_v2.py
function mockPredict(data) {
  const scoreOculto =
    (data.calif_software * 0.25) +
    (data.calif_bd * 0.20) +
    (data.calif_matematicas * 0.20) +
    (data.calif_logica * 0.20) +
    (data.calif_redes * 0.15) -
    (data.preguntas_omitidas * 2) -
    (data.cambios_respuesta * 0.5) +
    (data.racha_aciertos * 1.5) +
    (data.semestre_actual * 2);

  // Normalize to 0-100 probability (roughly the same scale)
  const rawProb = Math.min(Math.max((scoreOculto - 40) / 60, 0), 1);
  const probabilidad = Math.round(rawProb * 10000) / 100;
  const aprobado = probabilidad >= 50;

  return {
    probabilidad_aprobar: probabilidad,
    prediccion: aprobado ? 'Aprobado' : 'Reprobado',
    mensaje: aprobado
      ? '¡Excelente desempeño! Tienes altas probabilidades de pasar.'
      : 'Detectamos áreas de oportunidad. Necesitas reforzar tus conocimientos antes del examen.',
  };
}
