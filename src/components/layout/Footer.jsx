import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-light text-center text-muted py-3 mt-5">
      <div className="container">
        <p className="mb-0">
          &copy; {new Date().getFullYear()} Sistema de Detección IA - 
          Desarrollado por <a href="https://github.com/RubenOsiris073" target="_blank" rel="noopener noreferrer">RubenOsiris073</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;