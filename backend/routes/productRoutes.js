const express = require('express');
const router = express.Router();
const { db, COLLECTIONS } = require('../config/firebase');
const { collection, getDocs, doc, getDoc } = require('firebase/firestore');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    const snapshot = await getDocs(productsRef);
    const products = [];
    
    snapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ 
      error: 'Error al obtener productos',
      message: error.message 
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

module.exports = router;