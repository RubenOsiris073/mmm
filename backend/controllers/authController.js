const jwt = require('jsonwebtoken');
const { firebaseManager } = require('../config/firebaseManager');
const Logger = require('../utils/logger.js');

/**
 * Lista de usuarios autorizados para el sistema
 * En producción, esto debería estar en una base de datos con passwords hasheados
 */
const AUTHORIZED_USERS = [
  {
    uid: 'ruben-osiris-073',
    email: 'rubenosiris073@gmail.com',
    password: 'mmm-aguachile-2025', // En producción usar hash
    emailVerified: true,
    displayName: 'Ruben Osiris',
    role: 'admin'
  }
];

class AuthController {
  // Login con email y password usando verificación local
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: 'Datos requeridos',
          message: 'Email y password son requeridos'
        });
      }

      // Buscar usuario en la lista autorizada
      const user = AUTHORIZED_USERS.find(u => 
        u.email === email && u.password === password
      );

      if (!user) {
        return res.status(401).json({
          error: 'Credenciales inválidas',
          message: 'Email o password incorrectos'
        });
      }

      // Crear JWT para el frontend
      const jwtToken = jwt.sign(
        {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.TOKEN_EXPIRATION || '1h' }
      );

      res.json({
        success: true,
        token: jwtToken,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          role: user.role
        },
        message: 'Login exitoso'
      });

    } catch (error) {
      Logger.error('Error en login:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Error procesando el login'
      });
    }
  }

  // Verificar token JWT
  async verify(req, res) {
    try {
      // El token ya fue verificado por el middleware verifyToken
      const user = req.user;

      res.json({
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          role: user.role || 'user'
        },
        message: 'Token válido'
      });

    } catch (error) {
      Logger.error('Error verificando token:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Error verificando token'
      });
    }
  }

  // Logout (invalidar token del lado del cliente)
  async logout(req, res) {
    try {
      // En un sistema JWT stateless, el logout se maneja del lado del cliente
      // eliminando el token del almacenamiento local
      
      res.json({
        success: true,
        message: 'Logout exitoso. Token invalidado del lado del cliente.'
      });

    } catch (error) {
      Logger.error('Error en logout:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Error procesando logout'
      });
    }
  }
}

// Crear instancia del controlador
const authController = new AuthController();

module.exports = {
  login: authController.login.bind(authController),
  verify: authController.verify.bind(authController),
  logout: authController.logout.bind(authController)
};