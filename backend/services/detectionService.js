const fs = require('fs');
const path = require('path');
const { db, COLLECTIONS } = require('../config/firebase');
const { collection, addDoc, serverTimestamp, query, where, getDocs } = require('firebase/firestore');
const { queryDocuments } = require('../utils/firebaseUtils');
const webcamService = require('./webcamService');
const inventoryService = require('./inventoryService');

// Variable para estado global de detecciones
let continuousDetectionMode = false;

/**
 * Simula una detección (para pruebas)
 * En producción, esto usaría el modelo ML real
 */
function simulateDetection() {
  const labels = ['chicle', 'barrita', 'botella'];
  const now = new Date();
  const index = now.getSeconds() % labels.length;
  
  return { 
    label: labels[index], 
    similarity: 85 + (now.getMilliseconds() % 15) 
  };
}

/**
 * Realiza una detección usando la webcam
 * @returns {Promise<Object>} resultado de la detección
 */
async function performDetection() {
  try {
    let imagePath = null;
    let detection = { label: 'botella', similarity: 90 }; // Valor por defecto
    
    try {
      // Capturar imagen
      imagePath = await webcamService.captureImage();
      
      // En un sistema real, aquí se llamaría al modelo ML
      // Por ahora usamos la simulación
      detection = simulateDetection();
      
      console.log("Detección completada:", detection);
    } catch (captureError) {
      console.error("Error en captura o procesamiento:", captureError);
    } finally {
      // Limpiar imagen si existe
      if (imagePath) {
        webcamService.cleanupImage(imagePath);
      }
    }
    
    // Enriquecer el resultado con información del producto
    const productInfo = await findProductByLabel(detection.label);
    
    // Guardar la detección en la base de datos
    const detectionData = {
      label: detection.label,
      similarity: detection.similarity,
      timestamp: serverTimestamp(),
      productInfo: productInfo
    };
    
    const detectionsRef = collection(db, COLLECTIONS.DETECTIONS);
    const docRef = await addDoc(detectionsRef, detectionData);
    
    return {
      id: docRef.id,
      ...detection,
      productInfo,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error en el servicio de detección:", error);
    throw error;
  }
}

/**
 * Busca un producto por su etiqueta
 */
async function findProductByLabel(label) {
  if (!label) return null;
  
  try {
    // Usar la utilidad queryDocuments para simplificar la búsqueda
    const products = await queryDocuments(
      COLLECTIONS.PRODUCTS, 
      [['label', '==', label]] // filtro exacto
    );
    
    if (products.length > 0) {
      // Obtener stock
      const stock = await inventoryService.getProductStock(products[0].id);
      return {
        ...products[0],
        stock
      };
    }
    
    // Si no encuentra, intentar con case-insensitive (aquí no podemos usar queryDocuments
    // directamente porque necesitamos lógica custom)
    const allProducts = await queryDocuments(COLLECTIONS.PRODUCTS);
    
    const matchingProduct = allProducts.find(
      product => product.label && product.label.toLowerCase() === label.toLowerCase()
    );
    
    if (matchingProduct) {
      const stock = await inventoryService.getProductStock(matchingProduct.id);
      return {
        ...matchingProduct,
        stock
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error buscando producto por etiqueta:", error);
    return null;
  }
}

/**
 * Obtiene las últimas detecciones
 */
async function getRecentDetections(limit = 10) {
  try {
    // Usar la utilidad para simplificar la consulta
    const detections = await queryDocuments(
      COLLECTIONS.DETECTIONS,
      [], // sin filtros
      'timestamp', // ordenar por timestamp
      'desc', // orden descendente
      limit // límite
    );
    
    return detections;
  } catch (error) {
    console.error("Error obteniendo detecciones recientes:", error);
    return [];
  }
}
/**
 * Establece el modo de detección continua
 */
function setDetectionMode(active) {
  continuousDetectionMode = active;
  return { active: continuousDetectionMode };
}

/**
 * Obtiene el estado actual del modo de detección
 */
function getDetectionMode() {
  return { active: continuousDetectionMode };
}

module.exports = {
  performDetection,
  findProductByLabel,
  getRecentDetections,
  setDetectionMode,
  getDetectionMode
};