require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

// Importar configuraciones
const config = require('./config/config');
const corsOptions = require('./config/cors');

// Importar middleware
const { verifyToken } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

// Importar controladores
const systemController = require('./controllers/systemController');
const authController = require('./controllers/authController');

// Importar rutas
const productRoutes = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const detectionRoutes = require('./routes/detectionRoutes');
const salesRoutes = require('./routes/salesRoutes');
const transactionsRoutes = require('./routes/transactionsRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
const cartRoutes = require('./routes/cartRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const logsRoutes = require('./routes/logsRoutes');

// Importar servicios
const inventoryService = require('./services/inventoryService');
const googleSheetsService = require('./services/googleSheetsService');

// Configurar express
const app = express();

// Guardar tiempo de inicio del servidor
app.locals.startTime = new Date();

// Aplicar middleware global
app.use(logger);
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Crear router principal
const apiRouter = express.Router();

// =========================================================
// ENDPOINTS DE SISTEMA
// =========================================================
apiRouter.get('/health', systemController.healthCheck);
apiRouter.get('/status', systemController.serverStatus);
apiRouter.get('/firebase-config', systemController.firebaseConfig);

// =========================================================
// ENDPOINTS DE AUTENTICACIÓN
// =========================================================
apiRouter.post('/auth/login', authController.login);
apiRouter.get('/auth/verify', verifyToken, authController.verify);
apiRouter.post('/auth/logout', verifyToken, authController.logout);

// =========================================================
// REGISTRAR TODAS LAS RUTAS DE LA API
// =========================================================

// Registrar sub-rutas en el router principal
apiRouter.use('/products', productRoutes);
apiRouter.use('/inventory', inventoryRoutes);
apiRouter.use('/detection', detectionRoutes);
apiRouter.use('/sales', salesRoutes);
apiRouter.use('/transactions', transactionsRoutes);
apiRouter.use('/stripe', stripeRoutes);
apiRouter.use('/cart', cartRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/logs', logsRoutes);

// Montar el router principal en /api
app.use('/api', apiRouter);

// =========================================================
// CONFIGURACIÓN DE PRODUCCIÓN
// =========================================================

// Ruta para servir archivos estáticos en producción
if (config.env === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// =========================================================
// MANEJO DE ERRORES
// =========================================================

// Manejador de errores global
app.use(errorHandler);

// =========================================================
// INICIALIZACIÓN DE DATOS
// =========================================================

// Inicializar datos necesarios
(async () => {
  try {
    console.log("Inicializando inventario...");
    await inventoryService.initializeInventory();
    
    console.log("Inicializando servicio de Google Sheets...");
    await googleSheetsService.initialize();
  } catch (error) {
    console.error("Error en inicialización:", error);
  }
})();

// =========================================================
// INICIAR SERVIDOR
// =========================================================

// Puerto de escucha
const PORT = config.port;
const HOST = '0.0.0.0'; // Escuchar en todas las interfaces de red

app.listen(PORT, HOST, () => {
  console.log('=========================================================');
  console.log(`SERVIDOR BACKEND- ${new Date().toISOString()}`);
  console.log('=========================================================');
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
  console.log(`Modo: ${config.env}`);
  console.log('=========================================================');
  console.log('ENDPOINTS DISPONIBLES:');
  console.log('=========================================================');
  console.log('Sistema:');
  console.log('  - GET /api/health - Estado de salud del API');
  console.log('  - GET /api/status - Estado del servidor');
  console.log('  - GET /api/firebase-config - Configuración de Firebase');
  console.log('=========================================================');
  console.log('Autenticación:');
  console.log('  - POST /api/auth/login - Iniciar sesión');
  console.log('  - GET /api/auth/verify - Verificar token');
  console.log('  - POST /api/auth/logout - Cerrar sesión');
  console.log('=========================================================');
  console.log('Productos:');
  console.log('  - GET /api/products - Listar productos');
  console.log('  - GET /api/products/:id - Obtener producto');
  console.log('  - POST /api/products - Crear producto');
  console.log('  - PUT /api/products/:id - Actualizar producto');
  console.log('  - DELETE /api/products/:id - Eliminar producto');
  console.log('=========================================================');
  console.log('Inventario:');
  console.log('  - GET /api/inventory - Listar inventario');
  console.log('  - POST /api/inventory/update - Actualizar inventario');
  console.log('  - GET /api/inventory/movements - Movimientos de inventario');
  console.log('  - GET /api/inventory/summary - Resumen de inventario');
  console.log('=========================================================');
  console.log('Ventas:');
  console.log('  - GET /api/sales - Listar ventas');
  console.log('  - GET /api/sales/:id - Obtener venta');
  console.log('  - POST /api/sales - Crear venta');
  console.log('=========================================================');
  console.log('Carrito y Transacciones:');
  console.log('  - GET /api/cart - Obtener carrito');
  console.log('  - POST /api/cart - Agregar item al carrito');
  console.log('  - DELETE /api/cart/:id - Eliminar item del carrito');
  console.log('  - GET /api/transactions - Listar transacciones');
  console.log('=========================================================');
  console.log('Detección:');
  console.log('  - POST /api/detection - Detectar objetos');
  console.log('  - POST /api/detection/capture - Capturar imagen');
  console.log('=========================================================');
  console.log('Dashboard:');
  console.log('  - GET /api/dashboard/metrics - Métricas del dashboard');
  console.log('  - GET /api/dashboard/sales-data - Datos de ventas desde Google Sheets');
  console.log('=========================================================');
  console.log('Logs del Backend:');
  console.log('  - GET /api/logs - Obtener logs recientes');
  console.log('  - GET /api/logs/stream - Stream en tiempo real');
  console.log('  - POST /api/logs/clear - Limpiar logs');
  console.log('  - GET /api/logs/download - Descargar logs');
  console.log('=========================================================');
});

// Exportar para testing
module.exports = app;