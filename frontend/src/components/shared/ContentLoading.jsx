import React from 'react';
import './ContentLoading.css';

const ContentLoading = () => {
  return (
    <div className="content-loading">
      <div className="content-loading-container">
        <div className="content-loading-spinner"></div>
        <div className="content-loading-text">
          <h4>Cargando...</h4>
          <p>Preparando el contenido</p>
        </div>
      </div>
    </div>
  );
};

export default ContentLoading;
