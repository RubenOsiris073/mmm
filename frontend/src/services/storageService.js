import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc,
  deleteDoc,
  doc, 
  query, 
  orderBy, 
  where,
  limit,
  serverTimestamp 
} from "firebase/firestore";
import { db, getDb, COLLECTIONS } from "./firebase";

// Colecciones de Firestore (usando las colecciones centralizadas de firebase.js)
// Si quieres seguir usando tus propias constantes, puedes mantenerlas o remplazarlas
const DETECTIONS_COLLECTION = COLLECTIONS.DETECTIONS || 'detections';
const PRODUCTS_COLLECTION = COLLECTIONS.PRODUCTS || 'products';

// Función auxiliar para obtener la base de datos de Firestore
const getFirestore = () => {
  const db = getDb();
  if (!db) {
    throw new Error("Firestore no está inicializado. Asegúrate de llamar a initializeFirebase primero.");
  }
  return db;
};

// ======== FUNCIONES PARA DETECCIONES ========

/**
 * Agrega una nueva detección a Firestore
 * @param {Object} detectionData Datos de la detección
 * @returns {Promise<string>} ID del documento creado
 */
export const addDetection = async (detectionData) => {
  try {
    const db = getFirestore();
    const docRef = await addDoc(collection(db, DETECTIONS_COLLECTION), {
      ...detectionData,
      createdAt: serverTimestamp()
    });
    console.log("Detección guardada con ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error al guardar la detección:", error);
    throw error;
  }
};

/**
 * Obtiene todas las detecciones ordenadas por fecha
 * @returns {Promise<Array>} Lista de detecciones
 */
export const getDetections = async () => {
  try {
    const db = getFirestore();
    const q = query(
      collection(db, DETECTIONS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convertir Timestamp a string ISO para serialización más sencilla
      timestamp: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
    }));
  } catch (error) {
    console.error("Error al obtener detecciones:", error);
    throw error;
  }
};

/**
 * Elimina una detección por su ID
 * @param {string} detectionId ID de la detección
 * @returns {Promise<void>}
 */
export const deleteDetection = async (detectionId) => {
  try {
    const db = getFirestore();
    await deleteDoc(doc(db, DETECTIONS_COLLECTION, detectionId));
    console.log("Detección eliminada:", detectionId);
  } catch (error) {
    console.error("Error al eliminar la detección:", error);
    throw error;
  }
};

// ======== FUNCIONES PARA PRODUCTOS REGISTRADOS ========

/**
 * Guarda los detalles completos de un producto en Firestore
 * @param {Object} productData Datos del producto
 * @returns {Promise<string>} ID del documento creado
 */
export const saveProductDetails = async (productData) => {
  try {
    const db = getFirestore();
    // Remover cualquier fecha existente para evitar conflictos
    const { createdAt, updatedAt, ...cleanData } = productData;
    
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...cleanData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log("Producto registrado con ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error al guardar el producto:", error);
    throw error;
  }
};

export const updateProductDetails = async (productId, productData) => {
  try {
    const db = getFirestore();
    // Remover cualquier fecha existente para evitar conflictos
    const { createdAt, updatedAt, ...cleanData } = productData;
    
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(productRef, {
      ...cleanData,
      updatedAt: serverTimestamp()
    });
    
    console.log("Producto actualizado:", productId);
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    throw error;
  }
};

/**
 * Elimina un producto por su ID
 * @param {string} productId ID del producto
 * @returns {Promise<void>}
 */
export const deleteProduct = async (productId) => {
  try {
    const db = getFirestore();
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
    console.log("Producto eliminado:", productId);
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    throw error;
  }
};

/**
 * Obtiene todos los productos registrados ordenados por fecha
 * @returns {Promise<Array>} Lista de productos registrados
 */
export const getRegisteredProducts = async () => {
  try {
    console.log('Obteniendo productos registrados...');
    
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('ℹ️ No se encontraron productos registrados');
      return [];
    }

    const products = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        nombre: data.nombre || data.label || "Producto sin nombre",
        fechaRegistro: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        categoria: data.categoria || 'sin-categoria',
        // Asegurar que los campos numéricos sean números
        precio: typeof data.precio === 'string' ? parseFloat(data.precio) : data.precio,
        cantidad: typeof data.cantidad === 'string' ? parseInt(data.cantidad, 10) : data.cantidad
      };
    });

    console.log(`${products.length} productos recuperados`);
    return products;
  } catch (error) {
    console.error("Error al obtener productos registrados:", error);
    throw error;
  }
};

// Función auxiliar para manejar diferentes tipos de fechas
const getFormattedDate = (timestamp) => {
  if (!timestamp) {
    return new Date().toISOString();
  }
  
  // Si es un Timestamp de Firestore
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  
  // Si es un objeto Date
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  
  // Si es una cadena ISO
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  
  // Si es un número (timestamp en milisegundos)
  if (typeof timestamp === 'number') {
    return new Date(timestamp).toISOString();
  }
  
  // Por defecto
  return new Date().toISOString();
};
/**
 * Obtiene un producto específico por su ID
 * @param {string} productId ID del producto
 * @returns {Promise<Object|null>} Producto o null si no existe
 */
export const getProductById = async (productId) => {
  try {
    const db = getFirestore();
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        fechaRegistro: data.createdAt?.toDate().toISOString() || new Date().toISOString()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    throw error;
  }
};

/**
 * Obtiene productos por categoría
 * @param {string} category Categoría de los productos
 * @returns {Promise<Array>} Lista de productos de la categoría
 */
export const getProductsByCategory = async (category) => {
  try {
    const db = getFirestore();
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('categoria', '==', category),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fechaRegistro: data.createdAt?.toDate().toISOString() || new Date().toISOString()
      };
    });
  } catch (error) {
    console.error(`Error al obtener productos de categoría ${category}:`, error);
    throw error;
  }
};

// ======== FUNCIONES COMBINADAS PARA INVENTARIO ========

/**
 * Obtiene todos los productos del inventario (tanto detecciones como productos registrados)
 * @returns {Promise<Array>} Lista combinada de productos
 */
export const getAllInventoryProducts = async () => {
  try {
    // Obtener productos registrados
    const registeredProducts = await getRegisteredProducts();
    
    // Obtener detecciones que no se han convertido en productos completos
    const detectionsData = await getDetections();
    
    // Crear un mapa de productos registrados por su ID de detección original
    const registeredByDetectionId = new Map();
    registeredProducts.forEach(product => {
      if (product.detectionId) {
        registeredByDetectionId.set(product.detectionId, product);
      }
    });
    
    // Filtrar las detecciones que no tienen un producto asociado
    const uniqueDetections = detectionsData.filter(detection => 
      !registeredByDetectionId.has(detection.id)
    );
    
    // Convertir detecciones a formato compatible
    const formattedDetections = uniqueDetections.map(detection => ({
      ...detection,
      categoria: 'sin-categoria',
      nombre: detection.label
    }));
    
    // Combinar ambos conjuntos
    return [...registeredProducts, ...formattedDetections];
  } catch (error) {
    console.error("Error al obtener todos los productos:", error);
    throw error;
  }
};

/**
 * Busca productos por término
 * @param {string} searchTerm Término de búsqueda
 * @returns {Promise<Array>} Lista de productos coincidentes
 */
export const searchProducts = async (searchTerm) => {
  try {
    // Esta es una implementación básica usando client-side filtering
    // Para búsquedas más avanzadas, considerar Firebase Extensions como Algolia
    const allProducts = await getAllInventoryProducts();
    
    if (!searchTerm) return allProducts;
    
    const normalizedTerm = searchTerm.toLowerCase().trim();
    
    return allProducts.filter(product => {
      const nombre = (product.nombre || '').toLowerCase();
      const categoria = (product.categoria || '').toLowerCase();
      const notas = (product.notas || '').toLowerCase();
      const codigo = (product.codigo || '').toLowerCase();
      
      return nombre.includes(normalizedTerm) || 
             categoria.includes(normalizedTerm) ||
             notas.includes(normalizedTerm) ||
             codigo.includes(normalizedTerm);
    });
  } catch (error) {
    console.error("Error al buscar productos:", error);
    throw error;
  }
};

/**
 * Obtiene estadísticas básicas del inventario
 * @returns {Promise<Object>} Estadísticas
 */
export const getInventoryStats = async () => {
  try {
    const [allProducts, detections] = await Promise.all([
      getRegisteredProducts(),
      getDetections()
    ]);
    
    // Contar productos por categoría
    const categoryCounts = {};
    allProducts.forEach(product => {
      const cat = product.categoria || 'sin-categoria';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    
    return {
      totalProducts: allProducts.length,
      totalDetections: detections.length,
      categoryCounts,
      recentUpdates: allProducts.slice(0, 5)
    };
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    throw error;
  }
};