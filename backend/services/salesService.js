const { db, COLLECTIONS } = require('../config/firebase');
const { collection, addDoc, getDocs, query, orderBy, serverTimestamp } = require('firebase/firestore');
const inventoryService = require('./inventoryService');
const { processTimestamp } = require('../utils/helpers');

/**
 * Obtiene todas las ventas
 */
async function getAllSales() {
  try {
    const salesRef = collection(db, COLLECTIONS.SALES);
    const q = query(salesRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const sales = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      sales.push({
        id: doc.id,
        ...data,
        timestamp: processTimestamp(data.timestamp)
      });
    });
    
    return sales;
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    throw error;
  }
}

/**
 * Crea una nueva venta
 */
async function createSale(saleData) {
  try {
    const { items, total, paymentMethod, amountReceived, change, clientName } = saleData;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Se requieren productos en la venta");
    }
    
    // Crear documento de venta
    const saleRecord = {
      items,
      total,
      paymentMethod,
      amountReceived,
      change,
      clientName: clientName || "Cliente General",
      timestamp: serverTimestamp()
    };
    
    // Guardar en Firestore
    const salesRef = collection(db, COLLECTIONS.SALES);
    const docRef = await addDoc(salesRef, saleRecord);
    
    console.log("Venta creada correctamente, actualizando inventario...");
    
    // Actualizar inventario
    try {
      for (const item of items) {
        await inventoryService.updateStock(item.id, -item.quantity);
      }
      console.log("Inventario actualizado con éxito");
    } catch (walletError) {
      console.error("Error actualizando inventario:", walletError);
      // No fallar la venta, pero registrar el error
    }
    
    return { 
      success: true, 
      saleId: docRef.id 
    };
  } catch (error) {
    console.error("Error al crear venta:", error);
    throw error;
  }
}

module.exports = {
  getAllSales,
  createSale
};