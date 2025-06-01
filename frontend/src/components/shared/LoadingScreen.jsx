import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">
          <h3>Cargando...</h3>
          <p>Preparando el contenido</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;