import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  doc 
} from 'firebase/firestore';

import { COLLECTIONS, getDb } from './firebase';

// Función para obtener productos
export const getProducts = async () => {
  try {
    const db = getDb();
    if (!db) throw new Error('Firebase no está inicializado');
    
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    const q = query(productsRef, orderBy('nombre')); // Cambiar 'name' por 'nombre'
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
};

// Función para guardar detalles de un producto
export const saveProductDetails = async (product) => {
  try {
    const db = getDb();
    if (!db) throw new Error('Firebase no está inicializado');
    
    if (product.id) {
      const productRef = doc(db, COLLECTIONS.PRODUCTS, product.id);
      await updateDoc(productRef, product);
      return product;
    } else {
      const productsRef = collection(db, COLLECTIONS.PRODUCTS);
      const docRef = await addDoc(productsRef, product);
      return { ...product, id: docRef.id };
    }
  } catch (error) {
    console.error('Error al guardar detalles del producto:', error);
    throw error;
  }
};

// Función para eliminar un producto
export const deleteProduct = async (productId) => {
  try {
    const db = getDb();
    if (!db) throw new Error('Firebase no está inicializado');
    
    const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    await deleteDoc(productRef);
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    throw error;
  }
};

// Función para obtener productos registrados
export const getRegisteredProducts = async () => {
  return getProducts();
};

// Función para obtener detecciones
export const getDetections = async () => {
  try {
    const db = getDb();
    if (!db) throw new Error('Firebase no está inicializado');
    
    const detectionsRef = collection(db, 'detections');
    const snapshot = await getDocs(detectionsRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener detecciones:', error);
    return [];
  }
};

// Función para obtener productos con fechas seguras
export const getProductsWithSafeDates = async () => {
  const products = await getProducts();
  
  return products.map(product => ({
    ...product,
    createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
    updatedAt: product.updatedAt ? new Date(product.updatedAt) : new Date()
  }));
};

// Función para asignar categorías automáticamente basándose en el nombre del producto
export const assignCategoriesAutomatically = async () => {
  try {
    const db = getDb();
    if (!db) throw new Error('Firebase no está inicializado');
    
    const products = await getProducts();
    console.log(`Procesando ${products.length} productos para asignar categorías...`);
    
    let updatedCount = 0;
    
    for (const product of products) {
      // Si ya tiene categoría, saltar
      if (product.categoria) continue;
      
      const productName = (product.nombre || product.label || product.name || '').toLowerCase();
      let categoria = 'otros'; // categoría por defecto
      
      // Reglas para asignar categorías automáticamente
      if (productName.includes('agua') || productName.includes('gaseosa') || 
          productName.includes('jugo') || productName.includes('bebida') ||
          productName.includes('refresco') || productName.includes('soda') ||
          productName.includes('cerveza') || productName.includes('vino')) {
        categoria = 'bebidas';
      } else if (productName.includes('pan') || productName.includes('galleta') ||
                 productName.includes('cereal') || productName.includes('arroz') ||
                 productName.includes('pasta') || productName.includes('leche') ||
                 productName.includes('queso') || productName.includes('yogurt') ||
                 productName.includes('fruta') || productName.includes('verdura') ||
                 productName.includes('carne') || productName.includes('pollo') ||
                 productName.includes('pescado') || productName.includes('huevo')) {
        categoria = 'alimentos';
      } else if (productName.includes('detergente') || productName.includes('jabón') ||
                 productName.includes('limpiador') || productName.includes('cloro') ||
                 productName.includes('desinfectante') || productName.includes('papel') ||
                 productName.includes('toalla') || productName.includes('servilleta')) {
        categoria = 'limpieza';
      } else if (productName.includes('aspirina') || productName.includes('medicina') ||
                 productName.includes('pastilla') || productName.includes('jarabe') ||
                 productName.includes('vitamina') || productName.includes('analgesico') ||
                 productName.includes('antibiotico') || productName.includes('ibuprofeno')) {
        categoria = 'medicamentos';
      }
      
      // Actualizar el producto con la categoría asignada
      try {
        const productRef = doc(db, COLLECTIONS.PRODUCTS, product.id);
        await updateDoc(productRef, { categoria });
        updatedCount++;
        console.log(`Producto "${product.nombre || product.label}" categorizado como "${categoria}"`);
      } catch (error) {
        console.error(`Error actualizando producto ${product.id}:`, error);
      }
    }
    
    console.log(`Categorización completada: ${updatedCount} productos actualizados`);
    return { success: true, updatedCount };
    
  } catch (error) {
    console.error('Error al asignar categorías automáticamente:', error);
    throw error;
  }
};