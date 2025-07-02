const Logger = require('../utils/logger.js');
/**
 * Middleware para manejo centralizado de errores
 */
const errorHandler = (err, req, res, next) => {
  // Registrar el error
  Logger.error('Error:', err.message);
  Logger.error('Stack:', err.stack);

  // Determinar el código de estado
  let statusCode = err.statusCode || 500;

  // Mensajes personalizados para diferentes tipos de errores
  let message = 'Error del servidor';
  
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Error de validación de datos';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'No autorizado';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Acceso prohibido';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Recurso no encontrado';
  }

  // Error response
  res.status(statusCode).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' ? message : err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;