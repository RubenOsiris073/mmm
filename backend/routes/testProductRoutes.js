const express = require('express');
const router = express.Router();
const productService = require('../services/productService');

// GET /api/test/products - Obtener todos los productos para testing
router.get('/', async (req, res) => {
  try {
    console.log('Obteniendo productos para testing...');
    
    const products = await productService.getAllProducts();
    
    res.json({
      success: true,
      data: products,
      count: products.length,
      timestamp: new Date().toISOString(),
      testing: true
    });
  } catch (error) {
    console.error('Error obteniendo productos para testing:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos para testing',
      message: error.message,
      testing: true
    });
  }
});

// GET /api/test/products/:id - Obtener producto específico para testing
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Obteniendo producto para testing: ${id}`);
    
    const product = await productService.getProductById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado',
        testing: true
      });
    }
    
    res.json({
      success: true,
      data: product,
      timestamp: new Date().toISOString(),
      testing: true
    });
  } catch (error) {
    console.error('Error obteniendo producto para testing:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener producto para testing',
      message: error.message,
      testing: true
    });
  }
});

// POST /api/test/products - Crear producto para testing
router.post('/', async (req, res) => {
  try {
    console.log('Creando producto para testing:', req.body);
    
    const productData = {
      ...req.body,
      testing: true,
      createdAt: new Date().toISOString()
    };
    
    const newProduct = await productService.createProduct(productData);
    
    res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Producto de testing creado exitosamente',
      testing: true
    });
  } catch (error) {
    console.error('Error creando producto para testing:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear producto para testing',
      message: error.message,
      testing: true
    });
  }
});

// PUT /api/test/products/:id - Actualizar producto para testing
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Actualizando producto para testing: ${id}`);
    
    const updateData = {
      ...req.body,
      testing: true,
      updatedAt: new Date().toISOString()
    };
    
    const updatedProduct = await productService.updateProduct(id, updateData);
    
    res.json({
      success: true,
      data: updatedProduct,
      message: 'Producto de testing actualizado exitosamente',
      testing: true
    });
  } catch (error) {
    console.error('Error actualizando producto para testing:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar producto para testing',
      message: error.message,
      testing: true
    });
  }
});

// DELETE /api/test/products/:id - Eliminar producto para testing
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Eliminando producto para testing: ${id}`);
    
    await productService.deleteProduct(id);
    
    res.json({
      success: true,
      message: 'Producto de testing eliminado exitosamente',
      testing: true
    });
  } catch (error) {
    console.error('Error eliminando producto para testing:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar producto para testing',
      message: error.message,
      testing: true
    });
  }
});

module.exports = router;