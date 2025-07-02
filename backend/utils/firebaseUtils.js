const { COLLECTIONS } = require('../config/firebaseManager');
const firestore = require('./firestoreAdmin');
const { processTimestamp } = require('./helpers');
const Logger = require('./logger.js');

/**
 * Obtiene un documento de una colección por ID
 * @param {string} collectionName - nombre de la colección
 * @param {string} docId - ID del documento
 * @returns {Promise<object|null>} documento o null si no existe
 */
async function getDocumentById(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    
    return null;
  } catch (error) {
    Logger.error(`Error obteniendo documento ${docId} de ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Consulta documentos con filtros
 * @param {string} collectionName - nombre de la colección
 * @param {Array} filters - array de filtros [field, operator, value]
 * @param {string} orderByField - campo para ordenar (opcional)
 * @param {string} orderDirection - dirección ('asc' o 'desc')
 * @param {number} limitCount - límite de documentos (opcional)
 * @returns {Promise<Array>} array de documentos
 */
async function queryDocuments(collectionName, filters = [], orderByField = null, orderDirection = 'desc', limitCount = null) {
  try {
    const collectionRef = collection(db, collectionName);
    
    // Construir la consulta base
    let baseQuery = collectionRef;
    
    // Aplicar filtros
    if (filters && filters.length > 0) {
      filters.forEach(filter => {
        const [field, operator, value] = filter;
        baseQuery = query(baseQuery, where(field, operator, value));
      });
    }
    
    // Aplicar orden
    if (orderByField) {
      baseQuery = query(baseQuery, orderBy(orderByField, orderDirection));
    }
    
    // Aplicar límite
    if (limitCount) {
      baseQuery = query(baseQuery, limit(limitCount));
    }
    
    // Ejecutar consulta
    const querySnapshot = await getDocs(baseQuery);
    
    // Procesar resultados
    const documents = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      
      // Procesar timestamps si existen
      const processedData = {};
      for (const [key, value] of Object.entries(data)) {
        if (key.includes('time') || key.includes('date') || key.includes('At')) {
          processedData[key] = processTimestamp(value);
        } else {
          processedData[key] = value;
        }
      }
      
      documents.push({
        id: doc.id,
        ...processedData
      });
    });
    
    return documents;
  } catch (error) {
    Logger.error(`Error consultando documentos de ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Busca documentos por texto en un campo específico
 * @param {string} collectionName - nombre de la colección
 * @param {string} field - campo donde buscar
 * @param {string} searchTerm - término de búsqueda
 * @returns {Promise<Array>} documentos que coinciden
 */
async function searchByField(collectionName, field, searchTerm) {
  try {
    // Firebase no soporta búsqueda de texto nativa, así que hacemos una búsqueda manual
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    
    const results = [];
    const searchTermLower = searchTerm.toLowerCase();
    
    querySnapshot.forEach(doc => {
      const data = doc.data();
      if (data[field] && data[field].toString().toLowerCase().includes(searchTermLower)) {
        results.push({
          id: doc.id,
          ...data
        });
      }
    });
    
    return results;
  } catch (error) {
    Logger.error(`Error en búsqueda de ${searchTerm} en ${collectionName}.${field}:`, error);
    throw error;
  }
}

/**
 * Obtiene una marca de tiempo de servidor
 * @returns {object} objeto timestamp de Firebase
 */
function getServerTimestamp() {
  return serverTimestamp();
}

/**
 * Obtiene el nombre de una colección por su clave
 * @param {string} collectionKey - clave de la colección
 * @returns {string} nombre de la colección
 */
function getCollectionName(collectionKey) {
  return COLLECTIONS[collectionKey] || collectionKey;
}

module.exports = {
  getDocumentById,
  queryDocuments,
  searchByField,
  getServerTimestamp,
  getCollectionName
};