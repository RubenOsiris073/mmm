const express = require('express');
const router = express.Router();
const transactionsService = require('../services/transactionsService');

// Obtener transacciones con límite
router.get('/transactions', async (req, res) => {
  try {
    const limitVal = parseInt(req.query.limit) || 10;
    const transactions = await transactionsService.getTransactions(limitVal);
    res.json({ transactions });
  } catch (error) {
    console.error("Error al obtener transacciones:", error);
    res.status(500).json({ error: "Error al obtener transacciones", transactions: [] });
  }
});

module.exports = router;