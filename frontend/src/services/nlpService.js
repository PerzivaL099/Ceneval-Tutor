
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Envía un texto al modelo de clasificación NLP en el backend.
 * @param {string} textoUsuario - El texto ingresado por el usuario.
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 * Siempre retorna un objeto controlado; nunca lanza excepciones hacia la UI.
 */
export async function clasificarTexto(textoUsuario) {
  // --- Validación de entrada (Guard Clause) ---
  if (!textoUsuario || textoUsuario.trim() === "") {
    return {
      success: false,
      error: "El texto no puede estar vacío.",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/clasificar/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ texto: textoUsuario.trim() }),
    });

    // Manejar respuestas HTTP no-2xx (ej. 422 Unprocessable Entity, 500)
    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const detail = errorBody?.detail || `Error del servidor (HTTP ${response.status})`;
      return { success: false, error: detail };
    }

    const data = await response.json();
    return { success: true, data };

  } catch (networkError) {
    // Error de red: el backend no está corriendo o hay un problema de CORS
    console.error("[nlpService] Error de red:", networkError);
    return {
      success: false,
      error:
        "No se pudo conectar con el servidor. Verifica que el backend esté activo en " +
        API_BASE_URL,
    };
  }
}