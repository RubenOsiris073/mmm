const { COLLECTIONS } = require('../config/firebase');
const firestore = require('../utils/firestoreAdmin');

/**
 * Obtiene todos los productos directamente desde Firebase
 * El stock se lee directamente del campo 'cantidad' del documento PRODUCTS
 */
async function getAllProducts() {
  try {
    console.log("Obteniendo productos directamente desde Firebase PRODUCTS...");
    
    // Obtener productos del catálogo con stock incluido
    const products = await firestore.getDocs(COLLECTIONS.PRODUCTS);
    
    if (products.length === 0) {
      console.log("No hay productos en el catálogo");
      return [];
    }
    
    // Asegurar stock inicial para productos sin cantidad definida
    const productsWithStock = await Promise.all(products.map(async (product) => {
      let cantidad = product.cantidad;
      
      // Si no tiene cantidad definida, inicializar con stock aleatorio
      if (cantidad === undefined || cantidad === null) {
        cantidad = Math.floor(Math.random() * 50) + 10; // Stock entre 10-60
        
        // Actualizar en Firebase
        try {
          await firestore.updateDoc(COLLECTIONS.PRODUCTS, product.id, { 
            cantidad,
            stock: cantidad, // Mantener compatibilidad
            stockInitialized: true
          });
          console.log(`Stock inicializado para ${product.nombre}: ${cantidad}`);
        } catch (error) {
          console.error(`Error inicializando stock para ${product.id}:`, error);
        }
      }
      
      return {
        ...product,
        cantidad: cantidad || 0,
        stock: cantidad || 0 // Mantener compatibilidad con frontend
      };
    }));
    
    console.log(`Productos obtenidos: ${productsWithStock.length} (stock desde PRODUCTS)`);
    
    // Mostrar resumen de stock
    const productsWithStock_count = productsWithStock.filter(p => (p.cantidad || 0) > 0).length;
    const productsWithoutStock_count = productsWithStock.filter(p => (p.cantidad || 0) === 0).length;
    
    console.log(`Resumen: ${productsWithStock_count} con stock, ${productsWithoutStock_count} sin stock`);
    
    return productsWithStock;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw error;
  }
}

/**
 * Actualiza el stock de un producto directamente en PRODUCTS
 * Esta función reemplaza al inventoryService para unificar el manejo de stock
 */
async function updateProductStock(productId, adjustment, reason = 'Ajuste de stock') {
  try {
    console.log(`Actualizando stock en PRODUCTS - ID: ${productId}, Ajuste: ${adjustment}`);
    
    const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    const productDoc = await getDoc(productRef);
    
    if (!productDoc.exists()) {
      throw new Error(`Producto ${productId} no encontrado`);
    }
    
    const productData = productDoc.data();
    const currentStock = productData.cantidad || 0;
    const newStock = Math.max(0, currentStock + adjustment); // No permitir stock negativo
    
    // Actualizar stock en Firebase
    await updateDoc(productRef, {
      cantidad: newStock,
      stock: newStock, // Mantener compatibilidad
      updatedAt: serverTimestamp(),
      lastStockUpdate: {
        adjustment,
        reason,
        previousStock: currentStock,
        newStock,
        timestamp: serverTimestamp(),
        user: 'system'
      }
    });
    
    console.log(`Stock actualizado: ${productData.nombre} - ${currentStock} → ${newStock}`);
    
    return {
      success: true,
      productId,
      productName: productData.nombre,
      previousStock: currentStock,
      newStock,
      adjustment
    };
  } catch (error) {
    console.error(`Error actualizando stock para ${productId}:`, error);
    throw error;
  }
}

/**
 * Obtiene el stock actual de un producto desde PRODUCTS
 */
async function getProductStock(productId) {
  try {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    const productDoc = await getDoc(productRef);
    
    if (!productDoc.exists()) {
      return { stock: 0, exists: false };
    }
    
    const productData = productDoc.data();
    return { 
      stock: productData.cantidad || 0, 
      exists: true,
      productName: productData.nombre 
    };
  } catch (error) {
    console.error(`Error obteniendo stock para ${productId}:`, error);
    return { stock: 0, exists: false };
  }
}

/**
 * Busca productos por nombre o etiqueta con stock sincronizado
 */
async function searchProducts(term) {
  try {
    if (!term) {
      return await getAllProducts();
    }
    
    // Obtener todos los productos con stock para filtrar localmente
    const allProductsWithStock = await getAllProducts();
    
    // Filtrar por término de búsqueda
    const filteredProducts = allProductsWithStock.filter(product => 
      (product.nombre && product.nombre.toLowerCase().includes(term.toLowerCase())) ||
      (product.label && product.label.toLowerCase().includes(term.toLowerCase())) ||
      (product.codigo && product.codigo.toLowerCase().includes(term.toLowerCase()))
    );
    
    return filteredProducts;
  } catch (error) {
    console.error("Error buscando productos:", error);
    throw error;
  }
}

/**
 * Crea un nuevo producto
 */
async function createProduct(productData) {
  try {
    const { nombre, precio, categoria, label } = productData;
    
    if (!nombre || !precio) {
      throw new Error("Nombre y precio son requeridos");
    }
    
    const newProduct = {
      nombre,
      precio: parseFloat(precio),
      categoria: categoria || "",
      label: label || nombre.toLowerCase(),
      createdAt: firestore.serverTimestamp(),
      updatedAt: firestore.serverTimestamp()
    };
    
    const docRef = await firestore.addDoc(COLLECTIONS.PRODUCTS, newProduct);
    
    return { 
      id: docRef.id,
      ...newProduct,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error al crear producto:", error);
    throw error;
  }
}

module.exports = {
  getAllProducts,
  createProduct,
  searchProducts,
  updateProductStock,
  getProductStock
};