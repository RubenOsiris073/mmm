const express = require('express');
const router = express.Router();
const transactionsService = require('../services/transactionsService');

// Obtener todas las transacciones con límite
router.get('/', async (req, res) => {
  try {
    const limitVal = parseInt(req.query.limit) || 10;
    const transactions = await transactionsService.getTransactions(limitVal);
    res.json({
      success: true, 
      transactions
    });
  } catch (error) {
    console.error("Error al obtener transacciones:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Error al obtener transacciones",
      transactions: []
    });
  }
});

// Obtener transacciones por usuario
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limitVal = parseInt(req.query.limit) || 20;
    
    console.log(`Obteniendo transacciones para usuario ${userId} con límite ${limitVal}`);
    
    const transactions = await transactionsService.getUserTransactions(userId, limitVal);
    
    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error(`Error al obtener transacciones para usuario ${req.params.userId}:`, error);
    res.status(500).json({
      success: false,
      error: error.message || "Error al obtener transacciones del usuario",
      transactions: []
    });
  }
});

// Verificar estado de transacción por ID
router.get('/:transactionId/status', async (req, res) => {
  try {
    const { transactionId } = req.params;
    // Esta ruta es un placeholder por ahora
    // En una implementación completa, verificaría el estado actual de la transacción
    res.json({
      success: true,
      status: 'completed',
      transactionId
    });
  } catch (error) {
    console.error(`Error al verificar estado de transacción ${req.params.transactionId}:`, error);
    res.status(500).json({
      success: false,
      error: error.message || "Error al verificar estado de la transacción"
    });
  }
});

module.exports = router;