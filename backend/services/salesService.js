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
    
    console.log("Datos de venta recibidos:", JSON.stringify(saleData, null, 2));
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Se requieren productos en la venta");
    }
    
    console.log("Items de la venta:", JSON.stringify(items, null, 2));
    
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
        const productId = item.productId || item.id;
        console.log(`Actualizando stock para producto: ${productId}, cantidad: ${item.cantidad}`);
        
        if (!productId) {
          console.error('ProductId es undefined para item:', item);
          continue; // Saltar este item si no tiene ID válido
        }
        
        await inventoryService.updateStock(productId, -item.cantidad);
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