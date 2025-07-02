const { COLLECTIONS } = require('../config/firebaseManager');
const firestoreAdmin = require('../utils/firestoreAdmin');
const productService = require('./productService');
const { processTimestamp } = require('../utils/helpers');
const Logger = require('../utils/logger');

/**
 * Obtiene todas las ventas
 */
async function getAllSales() {
  try {
    const sales = await firestoreAdmin.queryDocs(COLLECTIONS.SALES, [], 'timestamp', 'desc');

    const processedSales = sales.map(sale => ({
      ...sale,
      timestamp: processTimestamp(sale.timestamp)
    }));

    Logger.info(`Obtenidas ${processedSales.length} ventas desde Firebase`);
    return processedSales;
  } catch (error) {
    Logger.error("Error al obtener ventas", { error: error.message });
    throw error;
  }
}

/**
 * Crea una nueva venta y actualiza el stock directamente en PRODUCTS
 */
async function createSale(saleData) {
  try {
    const { items, total, paymentMethod, amountReceived = 0, change = 0, clientName } = saleData;
    
    Logger.info("Procesando nueva venta:", { items: items.length, total });
    
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
    
    Logger.info("Venta creada correctamente, actualizando stock en PRODUCTS...");
    
    // Actualizar stock usando productService (PRODUCTS collection)
    try {
      Logger.info("Iniciando actualización de stock...");
      
      const stockUpdates = [];
      
      for (const item of items) {
        const productId = item.productId || item.id;
        const quantitySold = parseInt(item.cantidad, 10);
        
        Logger.info(`Actualizando stock para producto ${productId}: -${quantitySold}`);
        
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
          
          Logger.info(`Stock actualizado: ${updateResult.productName} - Nuevo stock: ${updateResult.newStock}`);
          
        } catch (stockError) {
          Logger.error(`Error actualizando stock para ${productId}:`, stockError);
          stockUpdates.push({
            productId,
            quantitySold,
            success: false,
            error: stockError.message
          });
        }
      }
      
      Logger.info("Resumen de actualizaciones de stock:", stockUpdates);
      
      // Verificar si hubo errores críticos
      const failedUpdates = stockUpdates.filter(update => !update.success);
      if (failedUpdates.length > 0) {
        Logger.warn(`${failedUpdates.length} productos no pudieron actualizar su stock`);
      }
      
    } catch (inventoryError) {
      Logger.error("Error general actualizando stock:", inventoryError);
      // No lanzar error para no cancelar la venta, pero registrar el problema
    }
    
    const newSale = {
      id: docRef.id,
      ...saleRecord,
      timestamp: new Date().toISOString()
    };
    
    Logger.info(`Venta procesada exitosamente: ${docRef.id}`);
    return newSale;
    
  } catch (error) {
    Logger.error("Error al crear venta:", error);
    throw error;
  }
}

module.exports = {
  getAllSales,
  createSale
};