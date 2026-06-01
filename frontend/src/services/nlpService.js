// frontend/src/services/nlpService.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const nlpService = {
  /**
   * Clasifica una pregunta ingresada usando el motor semántico BERT-CNN del backend
   * @param {string} text Pregunta o texto a evaluar
   * @returns {Promise<Object>} Resultado con el área, confianza y bandera de fuera de dominio
   */
  clasificarTexto: async (text) => {
    try {
      const response = await fetch(`${API_BASE_URL}/nlp/clasificar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Descomentar si requiere token de autenticación:
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ texto: text }),
      });

      if (!response.ok) {
        throw new Error('Error al procesar la clasificación en el servidor.');
      }

      return await response.json();
      /* El backend debe retornar un JSON con esta estructura esperada:
        {
          "area_detectada": "calif_software",
          "confianza": 0.945,
          "fuera_de_dominio": false
        }
      */
    } catch (error) {
      console.error('Error en nlpService.clasificarTexto:', error);
      throw error;
    }
  }
};