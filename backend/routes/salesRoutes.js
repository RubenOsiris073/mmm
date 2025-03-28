const express = require('express');
const router = express.Router();
const salesService = require('../services/salesService');

// Obtener todas las ventas
router.get('/sales', async (req, res) => {
  try {
    const sales = await salesService.getAllSales();
    res.json({ sales });
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    res.status(500).json({ error: "Error al obtener ventas", sales: [] });
  }
});

// Crear nueva venta
router.post('/sales', async (req, res) => {
  try {
    const result = await salesService.createSale(req.body);
    res.json(result);
  } catch (error) {
    console.error("Error al crear venta:", error);
    res.status(500).json({ error: error.message || "Error al crear venta" });
  }
});

module.exports = router;