const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
const { initializeApp } = require('firebase/app');
const { initializeInventory } = require('./services/inventoryService');
const config = require('./config/config');

// Importar rutas
const productRoutes = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const detectionRoutes = require('./routes/detectionRoutes');
const salesRoutes = require('./routes/salesRoutes');
const transactionsRoutes = require('./routes/transactionsRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
const cartRoutes = require('./routes/cartRoutes'); // Importar nuevas rutas

// Configurar express
const app = express();

// Configuración Firebase para autenticación
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Inicializar Firebase para auth
const firebaseApp = initializeApp(firebaseConfig, 'auth-app');
const auth = getAuth(firebaseApp);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'mmm-aguachile-super-secret-key-2025';

// Middleware para verificar JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

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

// ENDPOINTS DE AUTENTICACIÓN
// Login endpoint
apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    console.log('Intento de login para:', email);

    // Autenticar con Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Generar JWT token
    const token = jwt.sign(
      { 
        uid: user.uid, 
        email: user.email,
        emailVerified: user.emailVerified
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login exitoso para:', email);

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName
      }
    });

  } catch (error) {
    console.error('Error en login:', error.message);
    
    let errorMessage = 'Error al iniciar sesión';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'Usuario no encontrado';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Contraseña incorrecta';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Email inválido';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Demasiados intentos. Intenta más tarde';
        break;
      default:
        errorMessage = error.message;
    }

    res.status(400).json({ 
      success: false,
      error: errorMessage 
    });
  }
});

// Register endpoint
apiRouter.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    console.log('Intento de registro para:', email);

    // Crear usuario en Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Generar JWT token
    const token = jwt.sign(
      { 
        uid: user.uid, 
        email: user.email,
        emailVerified: user.emailVerified
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Registro exitoso para:', email);

    res.json({
      success: true,
      message: 'Usuario creado exitosamente',
      token,
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName
      }
    });

  } catch (error) {
    console.error('Error en registro:', error.message);
    
    let errorMessage = 'Error al crear usuario';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'El email ya está en uso';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Email inválido';
        break;
      case 'auth/weak-password':
        errorMessage = 'La contraseña debe tener al menos 6 caracteres';
        break;
      default:
        errorMessage = error.message;
    }

    res.status(400).json({ 
      success: false,
      error: errorMessage 
    });
  }
});

// Verify token endpoint
apiRouter.get('/auth/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token válido',
    user: req.user
  });
});

// Logout endpoint
apiRouter.post('/auth/logout', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logout exitoso'
  });
});

// Registrar sub-rutas en el router principal
apiRouter.use('/products', productRoutes);
apiRouter.use('/inventory', inventoryRoutes); // Ruta unificada de inventario
apiRouter.use('/detection', detectionRoutes);
apiRouter.use('/sales', salesRoutes);
apiRouter.use('/transactions', transactionsRoutes);
apiRouter.use('/stripe', stripeRoutes);
apiRouter.use('/cart', cartRoutes); // Registrar nuevas rutas

// Rutas de testing para productos
app.use('/api/test/products', require('./routes/testProductRoutes'));

// Montar el router principal en /api
app.use('/api', apiRouter);
app.use('/api', detectionRoutes);

// Configuración CORS mejorada para red mixta
const corsOptions = {
  origin: [
    'http://localhost',
    'http://localhost:80',
    'http://localhost:3000',
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Aplicar CORS
app.use(cors(corsOptions));

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

// Puerto de escucha - MODIFICADO para escuchar en todas las interfaces
const PORT = config.port;
const HOST = '0.0.0.0'; // Escuchar en todas las interfaces de red

app.listen(PORT, HOST, () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
  console.log(`Accesible desde:`);
  console.log(`   - Ethernet: http://154.0.0.9:${PORT}`);
  console.log(`   - WiFi: http://154.0.0.5:${PORT}`);
  console.log(`   - Localhost: http://localhost:${PORT}`);
  console.log(`Modo: ${config.env}`);
  console.log('Endpoints de autenticación:');
  console.log('- POST /api/auth/login - Iniciar sesión');
  console.log('- POST /api/auth/register - Registrar usuario');
  console.log('- GET /api/auth/verify - Verificar token');
  console.log('- POST /api/auth/logout - Cerrar sesión');
  console.log('Otros endpoints:');
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