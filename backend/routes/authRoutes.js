const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Rutas de autenticación
router.post('/login', authController.login);           // Login con email/password
router.get('/verify', verifyToken, authController.verify);  // Verificar token actual  
router.post('/logout', verifyToken, authController.logout); // Logout

module.exports = router;