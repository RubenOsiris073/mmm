import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useRouteLoading = (duration = 1000) => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Activar pantalla de carga cuando cambie la ruta
    setIsLoading(true);

    // Desactivar después del tiempo especificado
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [location.pathname, duration]);

  return isLoading;
};

export default useRouteLoading;