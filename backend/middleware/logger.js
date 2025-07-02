const Logger = require('../utils/logger');

/**
 * Middleware de logging para registrar información sobre las solicitudes
 */
const logger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  
  // Registrar información al inicio de la solicitud
  Logger.httpRequest(method, originalUrl);
  
  // Capturar cuando finaliza la respuesta
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    // Registrar información de finalización con el nuevo logger
    Logger.httpRequest(method, originalUrl, statusCode, duration);
  });
  
  next();
};

module.exports = logger;