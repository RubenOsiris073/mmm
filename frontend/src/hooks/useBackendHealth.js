import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para verificar el estado de conexión del backend
 * @param {number} checkInterval - Intervalo de verificación en milisegundos
 * @returns {Object} Estado y funciones para manejar la conexión del backend
 */
export const useBackendHealth = (checkInterval = 5000) => {
  const [isOnline, setIsOnline] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null); // Nuevo: tipo de error para mejor manejo

  // Estado para indicar si hay una verificación en curso
  const [isChecking, setIsChecking] = useState(false);

  /**
   * Verifica el estado de salud del backend
   * @returns {Promise<void>}
   */
  const checkBackendHealth = useCallback(async () => {
    console.log('Verificando estado del backend...');
    
    // Establecer estado de verificación en progreso
    setIsChecking(true);
    
    try {
      // Configurar timeout para la petición
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
      
      // Intentar primero con URL relativa (para desarrollo con proxy)
      const apiUrl = '/api/health';

      // Detección del entorno actual para mejor logging
      const isDev = process.env.NODE_ENV === 'development';
      console.log(`Entorno: ${isDev ? 'desarrollo' : 'producción'}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies en la petición
        signal: controller.signal,
        // No cache para asegurar respuesta fresca
        cache: 'no-cache'
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log('Backend respuesta:', data);
        
        if (data.status === 'ok') {
          setIsOnline(true);
          setError(null);
          setErrorType(null);
          console.log('Backend en línea confirmado');
        } else {
          setIsOnline(false);
          setError(`Backend responde con estado: ${data.status || 'desconocido'}`);
          setErrorType('status');
          console.log('Backend estado incorrecto:', data);
        }
      } else {
        setIsOnline(false);
        setError(`Error HTTP: ${response.status} - ${response.statusText}`);
        setErrorType('http');
        console.log('Backend error de respuesta:', response.status, response.statusText);
      }
    } catch (error) {
      setIsOnline(false);
      
      if (error.name === 'AbortError') {
        setError('Timeout - El servidor no responde tras 5 segundos');
        setErrorType('timeout');
        console.log('Backend timeout - No responde tras 5 segundos');
      } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        // Error común cuando el servidor está apagado o hay problemas de red
        setError('Servidor no disponible - Verifique que esté iniciado');
        setErrorType('connection');
        console.log('Backend no disponible:', error.message);
      } else if (error.message && error.message.includes('CORS')) {
        // Manejar específicamente errores CORS
        setError('Error CORS - Configuración del servidor incorrecta');
        setErrorType('cors');
        console.log('Error CORS en la verificación del backend:', error);
      } else {
        // Para cualquier otro error de conexión
        setError(`Error de conexión: ${error.message}`);
        setErrorType('unknown');
        console.log('Backend error de conexión:', error);
      }
      console.log('Backend health check failed:', error);
    } finally {
      // Actualizar siempre la última verificación y finalizar estado de verificación
      setLastChecked(new Date());
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    // Verificar inmediatamente al montar
    checkBackendHealth();

    // Configurar verificación periódica
    const interval = setInterval(checkBackendHealth, checkInterval);

    // Limpiar el intervalo al desmontar
    return () => clearInterval(interval);
  }, [checkBackendHealth, checkInterval]);

  /**
   * Función envuelta para verificar manualmente el estado del backend
   * Asegura que no se llame varias veces mientras está en progreso
   * @returns {Promise<void>}
   */
  const checkNow = useCallback(() => {
    if (!isChecking) {
      // Resetear algunos estados antes de verificar para mejor UX
      setError(null);
      return checkBackendHealth();
    } else {
      console.log('Ya se está verificando el estado del backend');
      return Promise.resolve(); // Devolver promesa resuelta para mantener consistencia
    }
  }, [isChecking, checkBackendHealth]);

  return {
    isOnline,
    lastChecked,
    error,
    errorType, // Nuevo: exponer el tipo de error
    isChecking,
    checkNow
  };
};

export default useBackendHealth;