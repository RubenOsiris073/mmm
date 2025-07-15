const express = require('express');
const router = express.Router();
const { COLLECTIONS } = require('../config/firebaseManager');
const firestore = require('../utils/firestoreAdmin');
const productService = require('../services/productService');
const Logger = require('../utils/logger.js');

// GET /api/products - Usar el servicio automatizado
router.get('/', async (req, res) => {
  try {
    // Usar el servicio que automáticamente inicializa stock si es necesario
    const products = await productService.getAllProducts();
    
    res.json({
      data: products,
      success: true,
      count: products.length
    });
  } catch (error) {
    Logger.error('Error al obtener productos:', error);
    res.status(500).json({ 
      error: 'Error al obtener productos',
      message: error.message,
      success: false
    });
  }
});

// Nuevo endpoint para inicializar stock automáticamente
router.post('/initialize-stock', async (req, res) => {
  try {
    Logger.info('🚀 Inicializando stock para todos los productos...');
    
    // Forzar la inicialización ejecutando getAllProducts
    const products = await productService.getAllProducts();
    
    // Contar productos con stock
    const productsWithStock = products.filter(p => p.cantidad > 0);
    const productsWithoutStock = products.filter(p => p.cantidad === 0);
    
    res.json({
      success: true,
      message: 'Stock inicializado correctamente',
      summary: {
        totalProducts: products.length,
        withStock: productsWithStock.length,
        withoutStock: productsWithoutStock.length
      }
    });
  } catch (error) {
    Logger.error('Error inicializando stock:', error);
    res.status(500).json({
      success: false,
      error: 'Error al inicializar stock',
      details: error.message
    });
  }
});

// Nuevo endpoint para obtener resumen de stock - MOVER ANTES DE /:id
router.get('/stock-summary', async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    
    const summary = {
      totalProducts: products.length,
      withStock: products.filter(p => p.cantidad > 0).length,
      withoutStock: products.filter(p => p.cantidad === 0).length,
      totalStock: products.reduce((sum, p) => sum + (p.cantidad || 0), 0),
      lowStock: products.filter(p => p.cantidad > 0 && p.cantidad <= 5).length
    };
    
    res.json({
      success: true,
      summary
    });
  } catch (error) {
    Logger.error('Error obteniendo resumen de stock:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener resumen de stock'
    });
  }
});

// GET /api/products/:id - DESPUÉS de las rutas específicas
router.get('/:id', async (req, res) => {
  try {
    const productDoc = await firestore.collection(COLLECTIONS.PRODUCTS).doc(req.params.id).get();

    if (!productDoc.exists) {
      return res.status(404).json({ 
        error: 'Producto no encontrado' 
      });
    }

    res.json({
      id: productDoc.id,
      ...productDoc.data()
    });
  } catch (error) {
    Logger.error('Error al obtener producto:', error);
    res.status(500).json({ 
      error: 'Error al obtener producto',
      message: error.message 
    });
  }
});

// PUT /api/products/:id/stock - Actualizar stock directamente en el producto
router.put('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { adjustment, reason = 'Ajuste manual' } = req.body;
    
    if (typeof adjustment !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'El ajuste debe ser un número'
      });
    }
    
    Logger.info(`Actualizando stock del producto ${id}: ajuste ${adjustment}`);
    
    // Usar productService unificado
    const updateResult = await productService.updateProductStock(id, adjustment, reason);
    
    res.json({
      success: true,
      message: 'Stock actualizado correctamente',
      product: {
        id,
        nombre: updateResult.productName,
        cantidad: updateResult.newStock,
        stock: updateResult.newStock
      },
      adjustment,
      newStock: updateResult.newStock
    });
    
  } catch (error) {
    Logger.error(`Error actualizando stock del producto ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar stock',
      message: error.message
    });
  }
});

// DELETE /api/products/:id - Eliminar producto completo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    Logger.info(`Eliminando producto completo: ${id}`);
    
    // Obtener el producto antes de eliminarlo
    const productDoc = await firestore.collection(COLLECTIONS.PRODUCTS).doc(id).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    const productData = productDoc.data();
    
    // Eliminar el producto (el stock está integrado en el mismo documento)
    await productDoc.ref.delete();
    
    Logger.info(`Producto eliminado: ${productData.nombre || id}`);
    
    res.json({
      success: true,
      message: 'Producto eliminado correctamente',
      deletedProduct: {
        id,
        nombre: productData.nombre || 'Producto sin nombre'
      }
    });
  } catch (error) {
    Logger.error(`Error eliminando producto ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar producto',
      message: error.message
    });
  }
});

module.exports = router;