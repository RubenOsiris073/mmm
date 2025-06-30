const { db } = require('../scripts/config/firebase');
const { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } = require('firebase/firestore');

const DETECTIONS_COLLECTION = 'detecciones';
const PRODUCTS_COLLECTION = 'productos';

const addDetection = async (detectionData) => {
  try {
    const docRef = await addDoc(collection(db, DETECTIONS_COLLECTION), {
      ...detectionData,
      createdAt: serverTimestamp()
    });
    console.log("Detección guardada con ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error al guardar detección:", error);
    throw error;
  }
};

const getDetections = async (limitCount = 10) => {
  try {
    const q = query(
      collection(db, DETECTIONS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
    }));
  } catch (error) {
    console.error("Error al obtener detecciones:", error);
    throw error;
  }
};

const getProductsByCategory = async (category) => {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('categoria', '==', category),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
    }));
  } catch (error) {
    console.error("Error al obtener productos por categoría:", error);
    throw error;
  }
};

module.exports = {
  addDetection,
  getDetections,
  getProductsByCategory
};