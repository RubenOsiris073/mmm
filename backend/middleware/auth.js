const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { firebaseManager } = require('../config/firebaseManager');
const Logger = require('../utils/logger.js');

dotenv.config();

// Middleware para verificar JWT token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token de autorización requerido',
        message: 'Debe incluir un token Bearer en el header Authorization' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verificar JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Agregar información del usuario al request
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      emailVerified: decoded.emailVerified
    };
    
    next();
  } catch (error) {
    Logger.error('Error verificando token JWT:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        message: 'El token de autenticación ha expirado' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido',
        message: 'El token de autenticación no es válido' 
      });
    }
    
    return res.status(401).json({ 
      error: 'Error de autenticación',
      message: 'No se pudo verificar el token de autenticación' 
    });
  }
};

module.exports = {
  verifyToken
};