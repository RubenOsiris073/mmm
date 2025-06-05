const express = require('express');
const router = express.Router();
const { db, COLLECTIONS } = require('../config/firebase');
const { collection, getDocs, doc, getDoc, deleteDoc, updateDoc, serverTimestamp } = require('firebase/firestore');
const productService = require('../services/productService');
const inventoryService = require('../services/inventoryService');

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
    console.error('Error al obtener productos:', error);
    res.status(500).json({ 
      error: 'Error al obtener productos',
      message: error.message,
      success: false
    });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, req.params.id);
    const productDoc = await getDoc(productRef);

    if (!productDoc.exists()) {
      return res.status(404).json({ 
        error: 'Producto no encontrado' 
      });
    }

    res.json({
      id: productDoc.id,
      ...productDoc.data()
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ 
      error: 'Error al obtener producto',
      message: error.message 
    });
  }
});

// Nuevo endpoint para inicializar stock automáticamente
router.post('/initialize-stock', async (req, res) => {
  try {
    console.log('🚀 Inicializando stock para todos los productos...');
    
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
    console.error('Error inicializando stock:', error);
    res.status(500).json({
      success: false,
      error: 'Error al inicializar stock',
      details: error.message
    });
  }
});

// Nuevo endpoint para obtener resumen de stock
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
    console.error('Error obteniendo resumen de stock:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener resumen de stock'
    });
  }
});

// DELETE /api/products/:id - Eliminar producto completo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Eliminando producto completo: ${id}`);
    
    // Primero eliminar del inventario si existe
    try {
      await inventoryService.updateStock(id, -999999, 'warehouse', 'Eliminación de producto');
    } catch (inventoryError) {
      console.log(`📦 Producto ${id} no encontrado en inventario o ya sin stock`);
    }
    
    // Luego eliminar del catálogo de productos
    const productRef = doc(db, COLLECTIONS.PRODUCTS, id);
    const productDoc = await getDoc(productRef);
    
    if (!productDoc.exists()) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    const productData = productDoc.data();
    await deleteDoc(productRef);
    
    console.log(`✅ Producto eliminado: ${productData.nombre || id}`);
    
    res.json({
      success: true,
      message: 'Producto eliminado correctamente',
      deletedProduct: {
        id,
        nombre: productData.nombre || 'Producto sin nombre'
      }
    });
  } catch (error) {
    console.error(`Error eliminando producto ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar producto',
      message: error.message
    });
  }
});

// **NUEVO ENDPOINT**: PUT /api/products/:id/stock - Actualizar stock directamente en el producto
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
    
    console.log(`📊 Actualizando stock del producto ${id}: ajuste ${adjustment}`);
    
    // Obtener el producto actual
    const productRef = doc(db, COLLECTIONS.PRODUCTS, req.params.id);
    const productDoc = await getDoc(productRef);
    
    if (!productDoc.exists()) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    const productData = productDoc.data();
    const currentStock = productData.cantidad || productData.stock || 0;
    const newStock = Math.max(0, currentStock + adjustment); // No permitir stock negativo
    
    await updateDoc(productRef, {
      cantidad: newStock,
      stock: newStock, // Mantener ambos campos para compatibilidad
      updatedAt: serverTimestamp(),
      lastUpdate: {
        adjustment,
        reason,
        user: 'RubenOsiris073', // En el futuro esto vendrá del auth
        timestamp: serverTimestamp()
      }
    });
    
    console.log(`✅ Stock actualizado: ${productData.nombre} - ${currentStock} → ${newStock}`);
    
    res.json({
      success: true,
      message: 'Stock actualizado correctamente',
      product: {
        id,
        nombre: productData.nombre,
        cantidad: newStock,
        stock: newStock,
        lastUpdate: {
          adjustment,
          reason,
          user: 'RubenOsiris073',
          timestamp: new Date()
        }
      },
      adjustment,
      newStock
    });
    
  } catch (error) {
    console.error(`Error actualizando stock del producto ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar stock',
      message: error.message
    });
  }
});

module.exports = router;