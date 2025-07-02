const Logger = require('../utils/logger');

/**
 * Archivo de ejemplo para demostrar el nuevo sistema de logging
 */

function ejemploLoggingAnterior() {
  Logger.info('Iniciando proceso de venta...');
  Logger.info('Productos en carrito:', { items: 3, total: 150.50 });
  Logger.info('Validando stock...');
  Logger.error('Error: Stock insuficiente para producto ID: 123');
  Logger.info('Finalizando proceso con errores');
}

function ejemploLoggingNuevo() {
  Logger.startOperation('Sale Process');
  
  Logger.info('Iniciando proceso de venta');
  Logger.debug('Productos en carrito', { 
    items: 3, 
    total: 150.50,
    sessionId: 'sess_abc123'
  });
  
  Logger.info('Validando stock de productos');
  Logger.error('Stock insuficiente para producto', { 
    productId: 123,
    stockActual: 0,
    stockRequerido: 2
  });
  
  Logger.endOperation('Sale Process', false);
}

function ejemploOperacionExitosa() {
  Logger.startOperation('Firebase Initialization');
  
  Logger.info('Cargando credenciales encriptadas');
  Logger.debug('Ruta de credenciales', { path: '/config/firebase.json' });
  
  Logger.success('Credenciales cargadas correctamente');
  Logger.success('Firebase inicializado', { projectId: 'mi-proyecto' });
  
  Logger.endOperation('Firebase Initialization', true, 1250);
}

function ejemploHTTPRequests() {
  // Simulación de requests HTTP
  Logger.httpRequest('GET', '/api/products');
  Logger.httpRequest('POST', '/api/sales', 201, 445);
  Logger.httpRequest('GET', '/api/invalid', 404, 12);
  Logger.httpRequest('POST', '/api/error', 500, 2301);
}

// Función para demostrar todos los ejemplos
function mostrarEjemplos() {
  Logger.separator('EJEMPLO DE LOGGING ANTERIOR VS NUEVO');
  
  Logger.info('\n1. LOGGING ANTERIOR (sin formato):');
  ejemploLoggingAnterior();
  
  Logger.info('\n\n2. LOGGING NUEVO (con formato y contexto):');
  ejemploLoggingNuevo();
  
  Logger.info('\n\n3. OPERACIÓN EXITOSA:');
  ejemploOperacionExitosa();
  
  Logger.info('\n\n4. HTTP REQUESTS:');
  ejemploHTTPRequests();
  
  Logger.separator('FIN DE EJEMPLOS');
}

module.exports = {
  mostrarEjemplos,
  ejemploLoggingAnterior,
  ejemploLoggingNuevo,
  ejemploOperacionExitosa,
  ejemploHTTPRequests
};

// Si se ejecuta directamente, mostrar ejemplos
if (require.main === module) {
  mostrarEjemplos();
}
