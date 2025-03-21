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
  import { db } from "./firebase";
  
  // Colecciones de Firestore
  const DETECTIONS_COLLECTION = 'detections';
  const PRODUCTS_COLLECTION = 'products';
  
  // ======== FUNCIONES PARA DETECCIONES ========
  
  /**
   * Agrega una nueva detección a Firestore
   * @param {Object} detectionData Datos de la detección
   * @returns {Promise<string>} ID del documento creado
   */
  export const addDetection = async (detectionData) => {
    try {
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
      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
        ...productData,
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
  
  /**
   * Actualiza un producto existente
   * @param {string} productId ID del producto
   * @param {Object} productData Nuevos datos del producto
   * @returns {Promise<void>}
   */
  export const updateProductDetails = async (productId, productData) => {
    try {
      const productRef = doc(db, PRODUCTS_COLLECTION, productId);
      await updateDoc(productRef, {
        ...productData,
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
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Asegurar que tengamos un nombre (usar label si es necesario)
          nombre: data.nombre || data.label || "Producto sin nombre",
          // Convertir Timestamp a string ISO para serialización más sencilla
          fechaRegistro: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
          // Categoría por defecto si no tiene una asignada
          categoria: data.categoria || 'sin-categoria'
        };
      });
    } catch (error) {
      console.error("Error al obtener productos registrados:", error);
      throw error;
    }
  };
  
  /**
   * Obtiene un producto específico por su ID
   * @param {string} productId ID del producto
   * @returns {Promise<Object|null>} Producto o null si no existe
   */
  export const getProductById = async (productId) => {
    try {
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