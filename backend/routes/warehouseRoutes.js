const express = require('express');
const router = express.Router();
const warehouseService = require('../services/warehouseService');

// Obtener inventario manual
router.get('/', async (req, res) => {
  try {
    const inventory = await warehouseService.getInventory();
    res.json(inventory);
  } catch (error) {
    console.error('Error en ruta de inventario:', error);
    res.status(500).json({ 
      error: 'Error al obtener inventario manual',
      details: error.message 
    });
  }
});

// Actualizar inventario manualmente
router.post('/update', async (req, res) => {
  const { productId, adjustment, timestamp } = req.body;
  
  try {
    const result = await warehouseService.updateInventory(
      productId, 
      adjustment, 
      timestamp
    );
    res.json(result);
  } catch (error) {
    console.error('Error en ruta de actualización:', error);
    res.status(500).json({ 
      error: 'Error al actualizar inventario manual',
      details: error.message 
    });
  }
});

// Obtener movimientos
router.get('/movements', async (req, res) => {
  try {
    const movements = await warehouseService.getMovements();
    res.json(movements);
  } catch (error) {
    console.error('Error en ruta de movimientos:', error);
    res.status(500).json({ 
      error: 'Error al obtener movimientos',
      details: error.message 
    });
  }
});

module.exports = router;