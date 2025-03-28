const express = require('express');
const router = express.Router();
const productService = require('../services/productService');

// Obtener todos los productos
router.get('/products', async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.json({ products });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos", products: [] });
  }
});

// Crear nuevo producto
router.post('/products', async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

module.exports = router;