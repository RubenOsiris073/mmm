const express = require('express');
const router = express.Router();
const inventoryService = require('../services/inventoryService');

// Obtener todo el inventario
router.get('/wallet', async (req, res) => {
  try {
    const wallet = await inventoryService.getInventory();
    res.json({ wallet });
  } catch (error) {
    console.error("Error al obtener wallet:", error);
    res.status(500).json({ error: "Error al obtener wallet", wallet: [] });
  }
});

// Actualizar inventario
router.post('/wallet', async (req, res) => {
  try {
    const { productId, adjustment } = req.body;
    
    if (!productId || adjustment === undefined) {
      return res.status(400).json({ error: "ProductId y adjustment son requeridos" });
    }
    
    const result = await inventoryService.updateStock(productId, parseInt(adjustment));
    
    res.json({
      success: true,
      product: result
    });
  } catch (error) {
    console.error("Error al actualizar wallet:", error);
    res.status(500).json({ error: error.message || "Error al actualizar wallet" });
  }
});

module.exports = router;