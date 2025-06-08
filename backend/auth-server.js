const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuración Firebase para autenticación
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Inicializar Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

// Secret para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key-aqui';

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

// Endpoint para login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    console.log('🔑 Intento de login para:', email);

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

    console.log('✅ Login exitoso para:', email);

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
    console.error('❌ Error en login:', error.message);
    
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

// Endpoint para registro
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    console.log('📝 Intento de registro para:', email);

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

    console.log('✅ Registro exitoso para:', email);

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
    console.error('❌ Error en registro:', error.message);
    
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

// Endpoint para verificar sesión
app.get('/auth/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token válido',
    user: req.user
  });
});

// Endpoint para logout (opcional - el token simplemente expira)
app.post('/auth/logout', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logout exitoso'
  });
});

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor de autenticación funcionando',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.AUTH_PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor de autenticación ejecutándose en puerto ${PORT}`);
  console.log(`📊 Proyecto Firebase: ${firebaseConfig.projectId}`);
  console.log(`🔗 Endpoints disponibles:`);
  console.log(`   POST /auth/login - Iniciar sesión`);
  console.log(`   POST /auth/register - Registrar usuario`);
  console.log(`   GET /auth/verify - Verificar token`);
  console.log(`   POST /auth/logout - Cerrar sesión`);
});

module.exports = app;