const jwt = require('jsonwebtoken');
const { admin } = require('../config/firebase');
const { JWT_SECRET } = require('../middleware/auth');

// Controlador para verificar token de Firebase
const verifyToken = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'Token de Firebase es requerido' });
    }

    console.log('Verificando token de Firebase');

    // Verificar token con Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Obtener información adicional del usuario
    const userRecord = await admin.auth().getUser(uid);

    // Generar JWT token personalizado
    const token = jwt.sign(
      { 
        uid: userRecord.uid, 
        email: userRecord.email,
        emailVerified: userRecord.emailVerified
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Token verificado exitosamente para:', userRecord.email);

    res.json({
      success: true,
      message: 'Token verificado exitosamente',
      token,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName
      }
    });

  } catch (error) {
    console.error('Error verificando token:', error.message);
    
    let errorMessage = 'Error al verificar token';
    
    if (error.code === 'auth/id-token-expired') {
      errorMessage = 'Token expirado';
    } else if (error.code === 'auth/invalid-id-token') {
      errorMessage = 'Token inválido';
    }

    res.status(401).json({
      success: false,
      error: errorMessage
    });
  }
};

// Controlador para crear usuario (registro)
const createUser = async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    console.log('Intento de crear usuario para:', email);

    // Crear usuario con Firebase Admin
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName || null,
      emailVerified: false
    });

    // Generar JWT token
    const token = jwt.sign(
      { 
        uid: userRecord.uid, 
        email: userRecord.email,
        emailVerified: userRecord.emailVerified
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Usuario creado exitosamente:', email);

    res.json({
      success: true,
      message: 'Usuario creado exitosamente',
      token,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName
      }
    });

  } catch (error) {
    console.error('Error creando usuario:', error.message);
    
    let errorMessage = 'Error al crear usuario';
    
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'El email ya está en uso';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email inválido';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'La contraseña debe tener al menos 6 caracteres';
    }

    res.status(400).json({ 
      success: false,
      error: errorMessage 
    });
  }
};

// Controlador para verificar token
const verify = (req, res) => {
  res.json({
    success: true,
    message: 'Token válido',
    user: req.user
  });
};

// Controlador para logout
const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logout exitoso'
  });
};

module.exports = {
  verifyToken,
  createUser,
  verify,
  logout
};