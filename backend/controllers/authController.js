const jwt = require('jsonwebtoken');
const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
const { auth } = require('../config/firebase');
const { JWT_SECRET } = require('../middleware/auth');

// Controlador para login
const login = async (req, res) => {
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
};

// Controlador para registro
const register = async (req, res) => {
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
  login,
  register,
  verify,
  logout
};