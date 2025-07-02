const express = require('express');
const router = express.Router();
const inventoryService = require('../services/inventoryService');
const Logger = require('../utils/logger.js');

// GET /api/inventory - Obtener todo el inventario
router.get('/', async (req, res) => {
  try {
    const inventory = await inventoryService.getInventory();
    res.json({
      success: true,
      data: inventory,
      count: inventory.length
    });
  } catch (error) {
    Logger.error('Error al obtener inventario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener inventario',
      message: error.message
    });
  }
});

// GET /api/inventory/:productId/stock - Obtener stock de un producto específico
router.get('/:productId/stock', async (req, res) => {
  try {
    const { productId } = req.params;
    const stockInfo = await inventoryService.getProductStock(productId);
    
    res.json({
      success: true,
      productId,
      stock: stockInfo.quantity,
      location: stockInfo.location
    });
  } catch (error) {
    Logger.error(`Error al obtener stock para ${req.params.productId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener stock del producto',
      message: error.message
    });
  }
});

// PUT /api/inventory/:productId/stock - Actualizar stock (ajuste relativo)
router.put('/:productId/stock', async (req, res) => {
  try {
    const { productId } = req.params;
    const { adjustment, reason, location } = req.body;
    
    if (typeof adjustment !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'El ajuste debe ser un número válido'
      });
    }
    
    Logger.info(`Actualizando stock: ${productId}, ajuste: ${adjustment}, razón: ${reason}`);
    
    const updatedItem = await inventoryService.updateStock(
      productId, 
      adjustment, 
      location || 'warehouse', 
      reason || 'Ajuste manual desde interfaz'
    );
    
    res.json({
      success: true,
      message: 'Stock actualizado correctamente',
      product: updatedItem,
      adjustment,
      newStock: updatedItem.cantidad
    });
  } catch (error) {
    Logger.error(`Error actualizando stock para ${req.params.productId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar stock',
      message: error.message
    });
  }
});

// PUT /api/inventory/:productId/set-stock - Establecer stock absoluto
router.put('/:productId/set-stock', async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, reason, location } = req.body;
    
    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'La cantidad debe ser un número válido mayor o igual a 0'
      });
    }
    
    Logger.info(`Estableciendo stock absoluto: ${productId}, cantidad: ${quantity}`);
    
    // Primero obtener el stock actual
    const currentStock = await inventoryService.getProductStock(productId);
    const currentQuantity = currentStock.quantity || 0;
    
    // Calcular el ajuste necesario
    const adjustment = quantity - currentQuantity;
    
    const updatedItem = await inventoryService.updateStock(
      productId, 
      adjustment, 
      location || 'warehouse', 
      reason || 'Establecer stock desde interfaz'
    );
    
    res.json({
      success: true,
      message: 'Stock establecido correctamente',
      product: updatedItem,
      previousStock: currentQuantity,
      newStock: quantity,
      adjustment
    });
  } catch (error) {
    Logger.error(`Error estableciendo stock para ${req.params.productId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Error al establecer stock',
      message: error.message
    });
  }
});

// GET /api/inventory/movements - Obtener movimientos de inventario
router.get('/movements', async (req, res) => {
  try {
    const { location, startDate, endDate, limit } = req.query;
    
    const filters = {};
    if (location) filters.location = location;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (limit) filters.limit = parseInt(limit);
    
    const movements = await inventoryService.getMovements(filters);
    
    res.json({
      success: true,
      data: movements,
      count: movements.length
    });
  } catch (error) {
    Logger.error('Error al obtener movimientos de inventario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener movimientos de inventario',
      message: error.message
    });
  }
});

module.exports = router;