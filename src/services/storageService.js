import { 
    collection, 
    addDoc, 
    getDocs, 
    getDoc, 
    doc, 
    query, 
    orderBy, 
    where,
    serverTimestamp 
  } from "firebase/firestore";
  import { db } from "./firebase";
  
  // Colecciones de Firestore
  const DETECTIONS_COLLECTION = 'detections';
  const PRODUCTS_COLLECTION = 'products';
  
  // Función para añadir una nueva detección
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
  
  // Función para obtener todas las detecciones ordenadas por fecha
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
  
  // Función para guardar detalles completos de un producto
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
  
  // Función para obtener productos registrados completos
  export const getRegisteredProducts = async () => {
    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaRegistro: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
      }));
    } catch (error) {
      console.error("Error al obtener productos registrados:", error);
      throw error;
    }
  };
  
  // Función para obtener un producto específico por ID
  export const getProductById = async (productId) => {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, productId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          fechaRegistro: docSnap.data().createdAt?.toDate().toISOString() || new Date().toISOString()
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error al obtener el producto:", error);
      throw error;
    }
  };