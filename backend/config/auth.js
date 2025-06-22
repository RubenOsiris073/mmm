const dotenv = require('dotenv');

dotenv.config();

// Configuración de autenticación
const authConfig = {
  // Secret para JWT
  jwtSecret: process.env.JWT_SECRET || 'tu-secret-key-aqui',
  
  // Duración del token (en segundos)
  tokenExpiration: process.env.TOKEN_EXPIRATION || '1h',
  
  // Configuración de cookies
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    sameSite: 'strict'
  }
};

module.exports = authConfig;