const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Obtener todo el wallet
router.get('/', async (req, res) => {
  try {
    const walletRef = db.collection('wallet');
    const snapshot = await walletRef.get();
    
    const wallet = [];
    snapshot.forEach(doc => {
      wallet.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(wallet);
  } catch (error) {
    console.error('Error al obtener wallet:', error);
    res.status(500).json({ error: 'Error al obtener wallet' });
  }
});

// Actualizar wallet
router.post('/update', async (req, res) => {
  try {
    const { productId, adjustment, timestamp } = req.body;
    
    // Obtener el producto actual
    const productRef = db.collection('products').doc(productId);
    const productDoc = await productRef.get();
    
    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    const productData = productDoc.data();
    const currentQuantity = productData.cantidad || 0;
    const newQuantity = currentQuantity + adjustment;
    
    // Actualizar cantidad
    await productRef.update({
      cantidad: newQuantity,
      updatedAt: timestamp
    });
    
    // Registrar transacción
    await db.collection('transactions').add({
      productId,
      productName: productData.nombre,
      tipo: adjustment > 0 ? 'entrada' : 'salida',
      cantidad: Math.abs(adjustment),
      timestamp
    });
    
    res.json({ 
      success: true,
      newQuantity,
      message: 'Wallet actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar wallet:', error);
    res.status(500).json({ error: 'Error al actualizar wallet' });
  }
});

module.exports = router;