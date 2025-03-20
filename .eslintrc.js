module.exports = {
    extends: [
      'react-app'
      // Removido 'react-app/jest' para evitar conflictos
    ],
    // No incluimos el plugin jest directamente
    rules: {
      'react-hooks/exhaustive-deps': 'warn',
      'import/no-anonymous-default-export': 'off'
    }
  };