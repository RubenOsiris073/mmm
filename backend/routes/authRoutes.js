const express = require('express');
const router = express.Router();
const { verifyToken: verifyFirebaseToken, createUser, verify, logout } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Rutas de autenticación
router.post('/verify-token', verifyFirebaseToken);  // Verificar token de Firebase
router.post('/create-user', createUser);           // Crear usuario (admin)
router.get('/verify', verifyToken, verify);        // Verificar JWT propio
router.post('/logout', verifyToken, logout);

module.exports = router;