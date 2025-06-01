module.exports = {
  extends: ['react-app'],
  rules: {
    'no-unused-vars': 'warn', // Cambiar de error a advertencia
    'react-hooks/exhaustive-deps': 'warn', // Cambiar de error a advertencia
    'import/no-anonymous-default-export': 'off' // Desactivar esta regla
  }
};