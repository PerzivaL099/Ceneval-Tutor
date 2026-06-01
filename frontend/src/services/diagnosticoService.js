

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const diagnosticoService = {
  /**
   * Obtiene el último resultado de la prueba diagnóstica del alumno
   * @returns {Harvester<Object>} Datos reales de ML (probabilidad_aprobar y areaScores)
   */
  getUltimoResultado: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/diagnostico/resultados/ultimo`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Si manejan tokens de autenticación en pasos posteriores:
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (response.status === 404) {
        // Un 404 indica explícitamente que el usuario no tiene exámenes previos (Estado Vacío)
        return null;
      }

      if (!response.ok) {
        throw new Error('Error al recuperar los datos del servidor.');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en diagnosticoService.getUltimoResultado:', error);
      throw error;
    }
  }
};