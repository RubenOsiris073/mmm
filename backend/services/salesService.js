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
    
    console.log("=== DATOS DE VENTA RECIBIDOS ===");
    console.log("Items completos:", JSON.stringify(items, null, 2));
    console.log("Total items:", items?.length);
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Se requieren productos en la venta");
    }
    
    // Validar cada item antes de procesar
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`Item ${i}:`, JSON.stringify(item, null, 2));
      console.log(`  - ID: ${item.id}`);
      console.log(`  - ProductId: ${item.productId}`);
      console.log(`  - Nombre: ${item.nombre}`);
      console.log(`  - Cantidad: ${item.cantidad}`);
      
      // Validar que cada item tenga los datos necesarios
      if (!item.productId && !item.id) {
        throw new Error(`Item ${i} no tiene ID válido`);
      }
      if (!item.cantidad || item.cantidad <= 0) {
        throw new Error(`Item ${i} no tiene cantidad válida`);
      }
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
      console.log("Iniciando actualización de inventario...");
      for (const item of items) {
        const productId = item.productId || item.id;
        console.log(`Intentando actualizar stock para producto: ${productId}, cantidad: ${item.cantidad}`);
        
        if (!productId) {
          console.error('ProductId es undefined para item:', item);
          continue; // Saltar este item si no tiene ID válido
        }
        
        // Actualizar stock restando la cantidad vendida
        await inventoryService.updateStock(productId, -item.cantidad, 'warehouse', 'Venta POS');
        console.log(`Stock actualizado exitosamente para ${productId}`);
      }
      console.log("Inventario actualizado con éxito");
    } catch (inventoryError) {
      console.error("Error actualizando inventario:", inventoryError);
      // No fallar la venta, pero registrar el error
      throw new Error(`Error actualizando inventario: ${inventoryError.message}`);
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