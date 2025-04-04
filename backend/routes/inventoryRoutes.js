const express = require('express');
const router = express.Router();
const { db, COLLECTIONS } = require('../config/firebase');
const { collection, getDocs, doc, getDoc, updateDoc, addDoc, increment, serverTimestamp } = require('firebase/firestore');

// GET /api/inventory
router.get('/', async (req, res) => {
  console.log('GET /inventory - Recibido');
  try {
    const inventoryRef = collection(db, COLLECTIONS.INVENTORY);
    const snapshot = await getDocs(inventoryRef);
    const inventory = [];
    
    snapshot.forEach(doc => {
      inventory.push({
        id: doc.id,
        ...doc.data()
      });
    });

    //console.log('Enviando inventario:', inventory);
    res.json(inventory);
  } catch (error) {
    console.error('Error al obtener inventario:', error);
    res.status(500).json({ 
      error: 'Error al obtener inventario',
      message: error.message 
    });
  }
});
// POST /api/inventory/update
router.post('/update', async (req, res) => {
  try {
    const { productId, adjustment, location, reason } = req.body;

    const inventoryRef = doc(db, COLLECTIONS.INVENTORY, productId);
    const inventoryDoc = await getDoc(inventoryRef);

    if (!inventoryDoc.exists()) {
      return res.status(404).json({ error: 'Producto no encontrado en inventario' });
    }

    const currentStock = inventoryDoc.data().cantidad || 0;
    const newStock = currentStock + adjustment;

    if (newStock < 0) {
      return res.status(400).json({ error: 'Stock insuficiente' });
    }

    await updateDoc(inventoryRef, {
      cantidad: increment(adjustment),
      location,
      updatedAt: serverTimestamp(),
      lastUpdate: {
        adjustment,
        reason,
        timestamp: serverTimestamp()
      }
    });

    // Registrar movimiento
    const movementRef = collection(db, COLLECTIONS.INVENTORY_MOVEMENTS);
    await addDoc(movementRef, {
      productId,
      adjustment,
      location,
      reason,
      previousQuantity: currentStock,
      newQuantity: newStock,
      timestamp: serverTimestamp()
    });

    const updatedDoc = await getDoc(inventoryRef);
    
    res.json({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });
  } catch (error) {
    console.error('Error al actualizar inventario:', error);
    res.status(500).json({ 
      error: 'Error al actualizar inventario',
      message: error.message 
    });
  }
});

module.exports = router;