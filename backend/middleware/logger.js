/**
 * Middleware de logging para registrar información sobre las solicitudes
 */
const logger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  
  // Registrar información al inicio de la solicitud
  console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} - IP: ${ip}`);
  
  // Capturar cuando finaliza la respuesta
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    // Determinar el nivel de log basado en el código de estado
    let logLevel = 'info';
    if (statusCode >= 400 && statusCode < 500) {
      logLevel = 'warn';
    } else if (statusCode >= 500) {
      logLevel = 'error';
    }
    
    // Registrar información de finalización
    console[logLevel](
      `[${new Date().toISOString()}] ${method} ${originalUrl} - ${statusCode} - ${duration}ms`
    );
  });
  
  next();
};

module.exports = logger;