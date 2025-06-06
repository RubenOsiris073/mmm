const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { initializeInventory } = require('./services/inventoryService');
const config = require('./config/config');

// Importar rutas
const productRoutes = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const detectionRoutes = require('./routes/detectionRoutes');
const salesRoutes = require('./routes/salesRoutes');
const transactionsRoutes = require('./routes/transactionsRoutes');
const stripeRoutes = require('./routes/stripeRoutes');

// Configurar express
const app = express();

// Configuración CORS unificada
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost', 'http://localhost:80'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
  optionsSuccessStatus: 204
};

// Aplicar CORS una sola vez
app.use(cors(corsOptions));


// Middleware de logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Configurar middleware de parsing con límites aumentados para imágenes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Crear router principal
const apiRouter = express.Router();

// Endpoint de salud en el router principal
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
    endpoints: {
      products: '/api/products',
      inventory: '/api/inventory', // Endpoint unificado
      detection: '/api/detection',
      sales: '/api/sales',
      transactions: '/api/transactions'
    },
  });
});

// API Status
apiRouter.get('/status', (req, res) => {
  res.json({
    isRunning: true,
    version: '1.0.0',
    environment: config.env,
    timestamp: new Date().toISOString()
  });
});

// Endpoint para proporcionar las credenciales de Firebase al frontend
apiRouter.get('/firebase-config', (req, res) => {
  res.json({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  });
});

// Registrar sub-rutas en el router principal
apiRouter.use('/products', productRoutes);
apiRouter.use('/inventory', inventoryRoutes); // Ruta unificada de inventario
apiRouter.use('/detection', detectionRoutes);
apiRouter.use('/sales', salesRoutes);
apiRouter.use('/transactions', transactionsRoutes);
apiRouter.use('/stripe', stripeRoutes);

// Montar el router principal en /api
app.use('/api', apiRouter);
app.use('/api', detectionRoutes);

// Ruta para servir archivos estáticos en producción
if (config.env === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  });
});

// Inicializar datos necesarios
(async () => {
  try {
    console.log("Inicializando inventario...");
    await initializeInventory();
  } catch (error) {
    console.error("Error en inicialización:", error);
  }
})();

// Puerto de escucha
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Modo: ${config.env}`);
  console.log('Endpoints disponibles:');
  console.log('- GET /api/health');
  console.log('- GET /api/status');
  console.log('- GET /api/firebase-config');
  console.log('- GET /api/inventory');
  console.log('- POST /api/inventory/update');
  console.log('- GET /api/inventory/movements');
  console.log('- GET /api/inventory/summary');
});

// Exportar para testing
module.exports = app;