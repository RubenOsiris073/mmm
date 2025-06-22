const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

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

module.exports = {
  verifyToken,
  JWT_SECRET
};