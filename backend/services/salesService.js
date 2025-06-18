const { db, COLLECTIONS } = require('../config/firebase');
const { collection, addDoc, getDocs, query, orderBy, serverTimestamp } = require('firebase/firestore');
const productService = require('./productService'); // Cambiar a productService
const { processTimestamp } = require('../utils/helpers');

/**
 * Obtiene todas las ventas
 */
async function getAllSales() {
  try {
    const salesRef = collection(db, COLLECTIONS.SALES);
    const q = query(salesRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);

    const sales = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      sales.push({
        id: doc.id,
        ...data,
        timestamp: processTimestamp(data.timestamp)
      });
    });

    console.log(`Obtenidas ${sales.length} ventas desde Firebase`);
    return sales;
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    throw error;
  }
}

/**
 * Crea una nueva venta y actualiza el stock directamente en PRODUCTS
 */
async function createSale(saleData) {
  try {
    const { items, total, paymentMethod, amountReceived = 0, change = 0, clientName } = saleData;
    
    console.log("Procesando nueva venta:", { items: items.length, total });
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("La venta debe tener al menos un producto");
    }
    
    // Validar items antes de procesar
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
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
    
    console.log("Venta creada correctamente, actualizando stock en PRODUCTS...");
    
    // Actualizar stock usando productService (PRODUCTS collection)
    try {
      console.log("Iniciando actualización de stock...");
      
      const stockUpdates = [];
      
      for (const item of items) {
        const productId = item.productId || item.id;
        const quantitySold = parseInt(item.cantidad, 10);
        
        console.log(`Actualizando stock para producto ${productId}: -${quantitySold}`);
        
        try {
          // Usar productService para actualizar stock directamente en PRODUCTS
          const updateResult = await productService.updateProductStock(
            productId, 
            -quantitySold, // Ajuste negativo para venta
            `Venta #${docRef.id}`
          );
          
          stockUpdates.push({
            productId,
            productName: updateResult.productName,
            quantitySold,
            newStock: updateResult.newStock,
            success: true
          });
          
          console.log(`Stock actualizado: ${updateResult.productName} - Nuevo stock: ${updateResult.newStock}`);
          
        } catch (stockError) {
          console.error(`Error actualizando stock para ${productId}:`, stockError);
          stockUpdates.push({
            productId,
            quantitySold,
            success: false,
            error: stockError.message
          });
        }
      }
      
      console.log("Resumen de actualizaciones de stock:", stockUpdates);
      
      // Verificar si hubo errores críticos
      const failedUpdates = stockUpdates.filter(update => !update.success);
      if (failedUpdates.length > 0) {
        console.warn(`${failedUpdates.length} productos no pudieron actualizar su stock`);
      }
      
    } catch (inventoryError) {
      console.error("Error general actualizando stock:", inventoryError);
      // No lanzar error para no cancelar la venta, pero registrar el problema
    }
    
    const newSale = {
      id: docRef.id,
      ...saleRecord,
      timestamp: new Date().toISOString()
    };
    
    console.log(`Venta procesada exitosamente: ${docRef.id}`);
    return newSale;
    
  } catch (error) {
    console.error("Error al crear venta:", error);
    throw error;
  }
}

module.exports = {
  getAllSales,
  createSale
};