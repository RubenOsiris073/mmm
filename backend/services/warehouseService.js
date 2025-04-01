const { getFirestore } = require('firebase/firestore');
const { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  orderBy, 
  query, 
  limit, 
  runTransaction,
  serverTimestamp 
} = require('firebase/firestore');

const db = getFirestore();

class WarehouseService {
  async getInventory() {
    try {
      const warehouseRef = collection(db, 'warehouse');
      const q = query(warehouseRef, orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const inventory = [];
      snapshot.forEach(doc => {
        inventory.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return inventory;
    } catch (error) {
      console.error('Error al obtener inventario:', error);
      throw new Error('Error al obtener inventario manual');
    }
  }

  async updateInventory(productId, adjustment, timestamp = null) {
    try {
      const warehouseRef = doc(db, 'warehouse', productId);
      const movementsRef = collection(db, 'warehouse_movements');

      // Realizar la actualización en una transacción
      await runTransaction(db, async (transaction) => {
        const docSnap = await getDoc(warehouseRef);
        
        let newQuantity = adjustment;
        if (docSnap.exists()) {
          newQuantity = (docSnap.data().quantity || 0) + adjustment;
        }

        // Actualizar o crear documento en warehouse
        await setDoc(warehouseRef, {
          productId,
          quantity: newQuantity,
          updatedAt: timestamp || serverTimestamp(),
          lastModifiedBy: 'RubenOsiris073', // Usuario actual
          lastModifiedAt: new Date().toISOString()
        }, { merge: true });

        // Registrar el movimiento
        const movementDoc = doc(movementsRef);
        await setDoc(movementDoc, {
          productId,
          quantityChange: adjustment,
          movementType: adjustment > 0 ? 'increment' : 'decrement',
          timestamp: timestamp || serverTimestamp(),
          createdBy: 'RubenOsiris073', // Usuario actual
          createdAt: new Date().toISOString()
        });
      });

      // Obtener el documento actualizado
      const updatedDoc = await getDoc(warehouseRef);
      
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      };

    } catch (error) {
      console.error('Error en actualización manual:', error);
      throw new Error('Error al actualizar inventario manual');
    }
  }

  async getMovements() {
    try {
      const movementsRef = collection(db, 'warehouse_movements');
      const q = query(
        movementsRef,
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      
      const movements = [];
      snapshot.forEach(doc => {
        movements.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Obtener los nombres de los productos
      const productsRef = collection(db, 'products');
      const productIds = [...new Set(movements.map(m => m.productId))];
      const productDocs = await Promise.all(
        productIds.map(id => getDoc(doc(productsRef, id)))
      );

      const productNames = {};
      productDocs.forEach(doc => {
        if (doc.exists()) {
          productNames[doc.id] = doc.data().name;
        }
      });

      // Agregar nombres de productos a los movimientos
      return movements.map(movement => ({
        ...movement,
        productName: productNames[movement.productId] || 'Producto sin nombre'
      }));

    } catch (error) {
      console.error('Error al obtener movimientos:', error);
      throw new Error('Error al obtener movimientos');
    }
  }
}

module.exports = new WarehouseService();