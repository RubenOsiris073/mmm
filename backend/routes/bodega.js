const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  serverTimestamp 
} = require('firebase/firestore');

// Obtener inventario
router.get('/inventario', async (req, res) => {
  try {
    const inventarioRef = collection(db, 'bodega_inventario');
    const q = query(inventarioRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const inventario = [];
    snapshot.forEach(doc => {
      inventario.push({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toDate()
      });
    });
    
    res.json(inventario);
  } catch (error) {
    console.error('Error al obtener inventario:', error);
    res.status(500).json({ error: 'Error al obtener inventario' });
  }
});

// Registrar movimiento
router.post('/movimientos', async (req, res) => {
  try {
    const { tipo, cantidad, producto, notas } = req.body;
    
    // Registrar movimiento
    const movimientoRef = collection(db, 'bodega_movimientos');
    const movimiento = await addDoc(movimientoRef, {
      tipo,
      cantidad,
      producto,
      notas,
      timestamp: serverTimestamp(),
      usuario: req.user?.email || 'sistema'
    });

    // Actualizar inventario
    const inventarioRef = collection(db, 'bodega_inventario');
    // Aquí iría la lógica para actualizar las cantidades

    res.json({
      success: true,
      movimientoId: movimiento.id
    });
  } catch (error) {
    console.error('Error al registrar movimiento:', error);
    res.status(500).json({ error: 'Error al registrar movimiento' });
  }
});

// Obtener movimientos
router.get('/movimientos', async (req, res) => {
  try {
    const limitCount = parseInt(req.query.limit) || 10;
    const movimientosRef = collection(db, 'bodega_movimientos');
    const q = query(
      movimientosRef, 
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const movimientos = [];
    
    snapshot.forEach(doc => {
      movimientos.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      });
    });
    
    res.json(movimientos);
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({ error: 'Error al obtener movimientos' });
  }
});

// Registrar producto
router.post('/productos', async (req, res) => {
  try {
    const { 
      nombre, 
      categoria, 
      deteccion,
      cantidad,
      tipo,
      notas 
    } = req.body;

    // Registrar producto
    const productosRef = collection(db, 'bodega_productos');
    const producto = await addDoc(productosRef, {
      nombre,
      categoria,
      deteccion,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      usuario: req.user?.email || 'sistema'
    });

    // Registrar movimiento inicial si hay cantidad
    if (cantidad > 0) {
      const movimientoRef = collection(db, 'bodega_movimientos');
      await addDoc(movimientoRef, {
        tipo,
        cantidad,
        producto: {
          id: producto.id,
          nombre
        },
        notas,
        timestamp: serverTimestamp(),
        usuario: req.user?.email || 'sistema'
      });
    }

    res.json({
      success: true,
      productoId: producto.id
    });
  } catch (error) {
    console.error('Error al registrar producto:', error);
    res.status(500).json({ error: 'Error al registrar producto' });
  }
});

module.exports = router;