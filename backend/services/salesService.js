const { COLLECTIONS } = require('../config/firebaseManager');
const firestoreAdmin = require('../utils/firestoreAdmin');
const productService = require('./productService');
const { processTimestamp } = require('../utils/helpers');
const Logger = require('../utils/logger');
const { firebaseManager } = require('../config/firebaseManager');

/**
 * Obtiene todas las ventas
 */
async function getAllSales() {
  try {
    const sales = await firestoreAdmin.queryDocs(COLLECTIONS.SALES, [], 'timestamp', 'desc', 50); // solo 50 ventas

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
      timestamp: new Date().toISOString()
    };
    
    // Guardar en Firestore usando firestoreAdmin
    const docRef = await firestoreAdmin.addDoc(COLLECTIONS.SALES, saleRecord);
    const saleId = docRef.id;
    
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
            `Venta #${saleId}`
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
      id: saleId,
      ...saleRecord
    };
    
    Logger.info(`Venta procesada exitosamente: ${saleId}`);
    return newSale;
    
  } catch (error) {
    Logger.error("Error al crear venta:", error);
    throw error;
  }
}

/**
 * Obtiene ventas paginadas
 * @param {Object} options
 * @param {number} options.limit - Cantidad de ventas por página
 * @param {string} [options.startAfter] - Timestamp o ID para paginación
 */
async function getSalesPaginated({ limit = 50, startAfter } = {}) {
  try {
    let queryOptions = [];
    if (startAfter) {
      queryOptions.push({ field: 'timestamp', op: '<', value: startAfter });
    }
    const sales = await firestoreAdmin.queryDocs(
      COLLECTIONS.SALES,
      queryOptions,
      'timestamp',
      'desc',
      limit
    );
    const processedSales = sales.map(sale => ({
      ...sale,
      timestamp: processTimestamp(sale.timestamp)
    }));
    Logger.info(`Obtenidas ${processedSales.length} ventas paginadas desde Firebase`);
    return processedSales;
  } catch (error) {
    Logger.error('Error al obtener ventas paginadas', { error: error.message });
    throw error;
  }
}

// Cache simple en memoria para historial de ventas recientes
const salesCache = {
  data: [],
  lastUpdated: 0,
  ttl: 60 * 1000, // 1 minuto
};

async function getCachedSales(limit = 50) {
  const now = Date.now();
  if (salesCache.data.length && now - salesCache.lastUpdated < salesCache.ttl) {
    Logger.info('Ventas obtenidas desde cache');
    return salesCache.data.slice(0, limit);
  }
  const sales = await getSalesPaginated({ limit });
  salesCache.data = sales;
  salesCache.lastUpdated = now;
  return sales;
}

module.exports = {
  getAllSales,
  createSale,
  getSalesPaginated,
  getCachedSales
};