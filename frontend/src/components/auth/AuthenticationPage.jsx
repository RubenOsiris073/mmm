import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AccessSelector from './AccessSelector';
import LoginForm from './LoginForm';

const AuthenticationPage = () => {
  const [currentView, setCurrentView] = useState('selector'); // 'selector' | 'login'
  const [selectedAccessType, setSelectedAccessType] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Si el usuario ya está autenticado, redirigir
  useEffect(() => {
    if (user) {
      console.log('Usuario ya autenticado, redirigiendo a /products');
      navigate('/products', { replace: true });
    }
  }, [user, navigate]);

  const handleSelectAccess = (accessType) => {
    console.log('Tipo de acceso seleccionado:', accessType);
    setSelectedAccessType(accessType);
    setCurrentView('login');
  };

  const handleBackToSelector = () => {
    console.log('Volviendo al selector de acceso');
    setCurrentView('selector');
    setSelectedAccessType(null);
  };

  const handleLoginSuccess = () => {
    console.log('=== INICIO handleLoginSuccess ===');
    console.log('Login exitoso detectado para:', selectedAccessType);
    console.log('Estado del usuario después del login:', user);
    
    // Usar un timeout más largo para asegurar que el AuthContext se actualice
    setTimeout(() => {
      console.log('Ejecutando redirección después del timeout');
      console.log('Usuario actualizado:', user);
      
      // Redirigir según el tipo de acceso seleccionado
      if (selectedAccessType === 'pos') {
        console.log('Redirigiendo al POS...');
        navigate('/pos', { replace: true });
      } else if (selectedAccessType === 'admin') {
        console.log('Redirigiendo a productos...');
        navigate('/products', { replace: true });
      } else {
        console.log('Redirigiendo a la página principal...');
        navigate('/products', { replace: true });
      }
    }, 500);
  };

  // No mostrar nada si el usuario ya está autenticado
  if (user) {
    return null;
  }

  return (
    <>
      {currentView === 'selector' && (
        <AccessSelector onSelectAccess={handleSelectAccess} />
      )}
      
      {currentView === 'login' && (
        <LoginForm 
          accessType={selectedAccessType}
          onBack={handleBackToSelector}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
};

export default AuthenticationPage;