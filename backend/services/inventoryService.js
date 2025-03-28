const { db, COLLECTIONS } = require('../config/firebase');
const { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, serverTimestamp, increment, addDoc } = require('firebase/firestore');
const { queryDocuments, getDocumentById, getServerTimestamp } = require('../utils/firebaseUtils');
const { processTimestamp } = require('../utils/helpers');

/**
 * Obtiene todo el inventario (wallet)
 */
async function getInventory() {
    try {
      // Usar utilidad para simplificar la consulta
      const wallet = await queryDocuments(COLLECTIONS.WALLET);
      
      console.log(`Obtenido wallet con ${wallet.length} items`);
      return wallet;
    } catch (error) {
      console.error("Error al obtener wallet:", error);
      throw error;
    }
  }
  
  /**
   * Actualiza el stock de un producto en el inventario
   */
  async function updateStock(productId, adjustment) {
    try {
      console.log(`Actualizando stock para ID: ${productId}, ajuste: ${adjustment}`);
      
      const walletRef = doc(db, COLLECTIONS.WALLET, productId);
      const walletDoc = await getDoc(walletRef);
      
      if (walletDoc.exists()) {
        // El producto ya existe en wallet, actualizar cantidad
        const currentStock = walletDoc.data().cantidad || 0;
        const newStock = currentStock + adjustment;
        
        console.log(`Stock actual: ${currentStock}, Nuevo stock: ${newStock}`);
        
        if (newStock < 0) {
          throw new Error("Stock insuficiente");
        }
        
        await updateDoc(walletRef, {
          cantidad: increment(adjustment),
          updatedAt: serverTimestamp()
        });
        
        // Registrar transacción
        const transRef = collection(db, COLLECTIONS.TRANSACTIONS);
        await addDoc(transRef, {
          productId,
          adjustment,
          timestamp: getServerTimestamp() // Usar utilidad
        });
        
        // Obtener datos actualizados
        const updatedItem = await getDocumentById(COLLECTIONS.WALLET, productId); // Usar utilidad
        return updatedItem;
      } else {
        // El producto no existe en wallet, buscarlo en products para crearlo
        const productData = await getDocumentById(COLLECTIONS.PRODUCTS, productId); // Usar utilidad
        
        if (productData) {
          // Crear entrada en wallet con stock inicial
          const initialStock = adjustment > 0 ? adjustment : 0;
          await setDoc(walletRef, {
            id: productId,
            nombre: productData.nombre || productData.label || "Producto",
            cantidad: initialStock,
            updatedAt: getServerTimestamp(), // Usar utilidad
            createdAt: getServerTimestamp() // Usar utilidad
          });
          
          // Registrar transacción si el ajuste es distinto de cero
          if (adjustment !== 0) {
            const transRef = collection(db, COLLECTIONS.TRANSACTIONS);
            await addDoc(transRef, {
              productId,
              adjustment,
              timestamp: getServerTimestamp() // Usar utilidad
            });
          }
          
          return {
            id: productId,
            nombre: productData.nombre || productData.label,
            cantidad: initialStock,
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          };
        } else {
          throw new Error(`Producto ${productId} no existe en la base de datos`);
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
async function initializeInventory() {
  try {
    console.log("Verificando inicialización del wallet...");
    const walletRef = collection(db, COLLECTIONS.WALLET);
    const walletSnapshot = await getDocs(walletRef);
    
    if (walletSnapshot.empty) {
      console.log("Wallet vacío. Inicializando con productos del catálogo...");
      const productsRef = collection(db, COLLECTIONS.PRODUCTS);
      const productsSnapshot = await getDocs(productsRef);
      
      let count = 0;
      for (const productDoc of productsSnapshot.docs) {
        const productData = productDoc.data();
        const walletItemRef = doc(db, COLLECTIONS.WALLET, productDoc.id);
        
        await setDoc(walletItemRef, {
          id: productDoc.id,
          nombre: productData.nombre || productData.label || "Producto sin nombre",
          cantidad: 10, // Stock inicial predeterminado
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });
        count++;
      }
      
      console.log(`Wallet inicializado con ${count} productos`);
    } else {
      console.log(`Wallet ya inicializado con ${walletSnapshot.size} productos`);
    }
    
    return true;
  } catch (error) {
    console.error("Error inicializando wallet:", error);
    return false;
  }
}

/**
 * Obtiene el stock actual de un producto
 */
async function getProductStock(productId) {
  try {
    const walletRef = doc(db, COLLECTIONS.WALLET, productId);
    const walletDoc = await getDoc(walletRef);
    
    if (walletDoc.exists()) {
      return walletDoc.data().cantidad || 0;
    }
    
    return 0;
  } catch (error) {
    console.error(`Error obteniendo stock para ${productId}:`, error);
    return 0;
  }
}

module.exports = {
  getInventory,
  updateStock,
  initializeInventory,
  getProductStock
};