const express = require('express');
const router = express.Router();
const inventoryService = require('../services/inventoryService');

// Obtener todo el inventario
router.get('/', async (req, res) => {
  try {
    const inventory = await inventoryService.getInventory();
    res.json(inventory);
  } catch (error) {
    console.error('Error en ruta de inventario:', error);
    res.status(500).json({ 
      error: 'Error al obtener inventario',
      details: error.message 
    });
  }
});

// Actualizar inventario
router.post('/update', async (req, res) => {
  const { productId, adjustment, location, reason } = req.body;
  
  try {
    if (!productId || !adjustment || !location || !reason) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        required: ['productId', 'adjustment', 'location', 'reason']
      });
    }

    const result = await inventoryService.updateInventory(
      productId, 
      adjustment,
      location,
      reason
    );
    res.json(result);
  } catch (error) {
    console.error('Error en ruta de actualización:', error);
    res.status(500).json({ 
      error: 'Error al actualizar inventario',
      details: error.message 
    });
  }
});

// Obtener movimientos con filtros
router.get('/movements', async (req, res) => {
  try {
    const filters = {
      location: req.query.location,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: parseInt(req.query.limit) || 50
    };

    const movements = await inventoryService.getMovements(filters);
    res.json(movements);
  } catch (error) {
    console.error('Error en ruta de movimientos:', error);
    res.status(500).json({ 
      error: 'Error al obtener movimientos',
      details: error.message 
    });
  }
});

// Obtener resumen de inventario
router.get('/summary', async (req, res) => {
  try {
    const summary = await inventoryService.getInventorySummary();
    res.json(summary);
  } catch (error) {
    console.error('Error en ruta de resumen:', error);
    res.status(500).json({ 
      error: 'Error al obtener resumen',
      details: error.message 
    });
  }
});

module.exports = router;