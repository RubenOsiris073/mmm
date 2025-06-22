const express = require('express');
const router = express.Router();
const { login, register, verify, logout } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Rutas de autenticación
router.post('/login', login);
router.post('/register', register);
router.get('/verify', verifyToken, verify);
router.post('/logout', verifyToken, logout);

module.exports = router;