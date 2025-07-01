const { COLLECTIONS } = require('../config/firebase');
const firestore = require('../utils/firestoreAdmin');
const { processTimestamp } = require('../utils/helpers');

class InventoryService {
  /**
   * Obtiene todo el inventario
   */
  async getInventory() {
    try {
      const inventory = await queryDocuments(COLLECTIONS.INVENTORY);
      console.log(`Obtenido inventario con ${inventory.length} items`);
      
      // Obtener información de productos relacionada
      const productIds = [...new Set(inventory.map(item => item.id))];
      const productsData = await Promise.all(
        productIds.map(id => getDocumentById(COLLECTIONS.PRODUCTS, id))
      );

      // Crear mapa de productos
      const productMap = {};
      productsData.forEach(product => {
        if (product) {
          productMap[product.id] = product;
        }
      });

      // Combinar datos
      const enrichedInventory = inventory.map(item => ({
        ...item,
        productName: productMap[item.id]?.nombre || productMap[item.id]?.label || "Producto sin nombre",
        productCode: productMap[item.id]?.codigo || "Sin código",
        category: productMap[item.id]?.categoria || "Sin categoría"
      }));

      return enrichedInventory;
    } catch (error) {
      console.error("Error al obtener inventario:", error);
      throw error;
    }
  }

  /**
   * Actualiza el stock de un producto en el inventario
   */
  async updateStock(productId, adjustment, location = 'warehouse', reason = 'Venta') {
    try {
      // Validación del productId
      if (!productId || typeof productId !== 'string') {
        throw new Error(`ProductId inválido: ${productId}`);
      }
      
      console.log(`Actualizando stock para ID: ${productId}, ajuste: ${adjustment}, ubicación: ${location}`);
      
      const inventoryRef = doc(db, COLLECTIONS.INVENTORY, productId);
      const inventoryDoc = await getDoc(inventoryRef);
      
      const timestamp = getServerTimestamp();
      
      if (inventoryDoc.exists()) {
        // El producto ya existe en inventario
        const currentStock = inventoryDoc.data().cantidad || 0;
        const newStock = currentStock + adjustment;
        
        //console.log(`Stock actual: ${currentStock}, Nuevo stock: ${newStock}`);
        
        if (newStock < 0) {
          throw new Error("Stock insuficiente");
        }
        
        await updateDoc(inventoryRef, {
          cantidad: increment(adjustment),
          location,
          updatedAt: serverTimestamp(),
          lastUpdate: {
            adjustment,
            reason,
            timestamp,
            user: 'RubenOsiris073'
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
          timestamp: serverTimestamp(),
          createdAt: timestamp,
          createdBy: 'RubenOsiris073'
        });
        
        // Obtener datos actualizados
        const updatedItem = await getDocumentById(COLLECTIONS.INVENTORY, productId);
        return updatedItem;
      } else {
        // El producto no existe en inventario
        console.log(`Producto ${productId} no existe en inventario, intentando crearlo...`);
        
        // Primero intentar buscarlo en products
        const productData = await getDocumentById(COLLECTIONS.PRODUCTS, productId);
        
        if (productData) {
          // El producto existe en la colección products, crear entrada en inventario
          const initialStock = adjustment > 0 ? adjustment : 0;
          
          // Si el ajuste es negativo y no hay inventario, no permitir la venta
          if (adjustment < 0) {
            console.log(`No se puede vender producto ${productId}: no hay stock disponible`);
            throw new Error(`Stock insuficiente para el producto ${productData.nombre || productId}`);
          }
          
          await setDoc(inventoryRef, {
            id: productId,
            nombre: productData.nombre || productData.label || "Producto",
            cantidad: initialStock,
            location,
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
            lastUpdate: {
              adjustment,
              reason,
              timestamp,
              user: 'RubenOsiris073'
            }
          });
          
          // Registrar movimiento inicial
          if (adjustment !== 0) {
            const movementRef = collection(db, COLLECTIONS.INVENTORY_MOVEMENTS);
            await addDoc(movementRef, {
              productId,
              adjustment,
              location,
              reason: reason || 'Inicialización de inventario',
              previousQuantity: 0,
              newQuantity: initialStock,
              timestamp: serverTimestamp(),
              createdAt: timestamp,
              createdBy: 'RubenOsiris073'
            });
          }
          
          return {
            id: productId,
            nombre: productData.nombre || productData.label,
            cantidad: initialStock,
            location,
            updatedAt: timestamp,
            createdAt: timestamp
          };
        } else {
          // El producto no existe ni en products ni en inventario
          // Para ventas, esto no debería pasar - vamos a permitirlo pero con advertencia
          console.warn(`Producto ${productId} no existe en la base de datos, pero se permite la venta`);
          
          // Si es una venta (ajuste negativo), no podemos proceder sin producto
          if (adjustment < 0) {
            throw new Error(`No se puede vender un producto inexistente: ${productId}`);
          }
          
          // Si es un incremento de stock, crear el producto con datos mínimos
          const initialStock = adjustment > 0 ? adjustment : 0;
          await setDoc(inventoryRef, {
            id: productId,
            nombre: `Producto ${productId}`,
            cantidad: initialStock,
            location,
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
            lastUpdate: {
              adjustment,
              reason,
              timestamp,
              user: 'RubenOsiris073'
            }
          });
          
          return {
            id: productId,
            nombre: `Producto ${productId}`,
            cantidad: initialStock,
            location,
            updatedAt: timestamp,
            createdAt: timestamp
          };
        }
      }
    } catch (error) {
      console.error("Error actualizando stock:", error);
      throw error;
    }
  }

  /**
   * Inicializa el inventario para todos los productos
   */
  async initializeInventory() {
    try {
      console.log("Verificando inicialización del inventario...");
      const inventoryDocs = await firestore.getDocs(COLLECTIONS.INVENTORY);
      
      // Obtener todos los productos del catálogo
      const productsDocs = await firestore.getDocs(COLLECTIONS.PRODUCTS);
      
      console.log(`Productos en catálogo: ${productsSnapshot.size}`);
      console.log(`Productos en inventario: ${inventorySnapshot.size}`);
      
      // Crear un mapa de productos existentes en inventario
      const existingInventoryIds = new Set();
      inventorySnapshot.forEach(doc => {
        existingInventoryIds.add(doc.id);
      });
      
      let createdCount = 0;
      
      // Crear entradas de inventario para productos que no las tienen
      for (const productDoc of productsSnapshot.docs) {
        if (!existingInventoryIds.has(productDoc.id)) {
          const productData = productDoc.data();
          const inventoryItemRef = doc(db, COLLECTIONS.INVENTORY, productDoc.id);
          
          const timestamp = getServerTimestamp();
          
          await setDoc(inventoryItemRef, {
            id: productDoc.id,
            nombre: productData.nombre || productData.label || "Producto sin nombre",
            cantidad: 10, // Stock inicial de 10 unidades para productos nuevos
            location: 'warehouse',
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
            lastUpdate: {
              adjustment: 10,
              reason: 'Inicialización de inventario - Stock inicial',
              timestamp,
              user: 'RubenOsiris073'
            }
          });
          
          // Registrar movimiento inicial
          const movementRef = collection(db, COLLECTIONS.INVENTORY_MOVEMENTS);
          await addDoc(movementRef, {
            productId: productDoc.id,
            adjustment: 10,
            location: 'warehouse',
            reason: 'Inicialización de inventario - Stock inicial',
            previousQuantity: 0,
            newQuantity: 10,
            timestamp: serverTimestamp(),
            createdAt: timestamp,
            createdBy: 'RubenOsiris073'
          });
          
          createdCount++;
          console.log(`Creada entrada de inventario para: ${productData.nombre || productDoc.id}`);
        }
      }
      
      if (createdCount > 0) {
        console.log(`Inventario actualizado: ${createdCount} nuevas entradas creadas`);
      } else {
        console.log(`Inventario ya está sincronizado con el catálogo de productos`);
      }
      
      return true;
    } catch (error) {
      console.error("Error inicializando inventario:", error);
      return false;
    }
  }

  /**
   * Obtiene el stock actual de un producto
   */
  async getProductStock(productId) {
    try {
      const inventoryRef = doc(db, COLLECTIONS.INVENTORY, productId);
      const inventoryDoc = await getDoc(inventoryRef);
      
      if (inventoryDoc.exists()) {
        return {
          quantity: inventoryDoc.data().cantidad || 0,
          location: inventoryDoc.data().location
        };
      }
      
      return { quantity: 0, location: null };
    } catch (error) {
      console.error(`Error obteniendo stock para ${productId}:`, error);
      return { quantity: 0, location: null };
    }
  }

  /**
   * Obtiene los movimientos de inventario with filtros
   */
  async getMovements(filters = {}) {
    try {
      const movementsRef = collection(db, COLLECTIONS.INVENTORY_MOVEMENTS);
      let q = query(movementsRef, orderBy('timestamp', 'desc'));

      if (filters.location) {
        q = query(q, where('location', '==', filters.location));
      }
      if (filters.startDate) {
        q = query(q, where('createdAt', '>=', filters.startDate));
      }
      if (filters.endDate) {
        q = query(q, where('createdAt', '<=', filters.endDate));
      }
      
      q = query(q, limit(filters.limit || 50));
      
      const snapshot = await getDocs(q);
      const movements = [];
      
      snapshot.forEach(doc => {
        movements.push({
          id: doc.id,
          ...doc.data(),
          timestamp: processTimestamp(doc.data().timestamp)
        });
      });

      // Enriquecer con datos de productos
      const productIds = [...new Set(movements.map(m => m.productId))];
      const productsData = await Promise.all(
        productIds.map(id => getDocumentById(COLLECTIONS.PRODUCTS, id))
      );

      const productMap = {};
      productsData.forEach(product => {
        if (product) {
          productMap[product.id] = product;
        }
      });

      return movements.map(movement => ({
        ...movement,
        productName: productMap[movement.productId]?.nombre || "Producto sin nombre",
        productCode: productMap[movement.productId]?.codigo || "Sin código",
        category: productMap[movement.productId]?.categoria || "Sin categoría"
      }));

    } catch (error) {
      console.error("Error al obtener movimientos:", error);
      throw error;
    }
  }
}

module.exports = new InventoryService();