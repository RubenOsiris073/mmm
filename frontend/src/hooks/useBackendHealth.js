import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para verificar el estado de conexión del backend
 */
export const useBackendHealth = (checkInterval = 5000) => {
  const [isOnline, setIsOnline] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);
  const [error, setError] = useState(null);

  const checkBackendHealth = useCallback(async () => {
    console.log('🔍 Verificando estado del backend...');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos timeout

      const response = await fetch('http://localhost:5000/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend respuesta:', data);
        if (data.status === 'ok') {
          setIsOnline(true);
          setError(null);
          setLastChecked(new Date());
          console.log('✅ Backend en línea confirmado');
        } else {
          setIsOnline(false);
          setError('Backend responde pero con estado incorrecto');
          console.log('⚠️ Backend estado incorrecto:', data);
        }
      } else {
        setIsOnline(false);
        setError(`Backend respondió con código ${response.status}`);
        console.log('❌ Backend error de respuesta:', response.status);
      }
    } catch (error) {
      setIsOnline(false);
      if (error.name === 'AbortError') {
        setError('Timeout - Backend no responde');
        console.log('⏰ Backend timeout');
      } else {
        setError('Error de conexión al backend');
        console.log('💥 Backend error de conexión:', error.message);
      }
      console.log('❌ Backend health check failed:', error.message);
    }
  }, []);

  useEffect(() => {
    // Verificar inmediatamente al montar
    checkBackendHealth();

    // Configurar verificación periódica
    const interval = setInterval(checkBackendHealth, checkInterval);

    return () => clearInterval(interval);
  }, [checkBackendHealth, checkInterval]);

  return {
    isOnline,
    lastChecked,
    error,
    checkNow: checkBackendHealth
  };
};

export default useBackendHealth;