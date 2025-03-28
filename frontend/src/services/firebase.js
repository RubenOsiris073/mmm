import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import { getStorage } from "firebase/storage";

// Colecciones de Firestore
export const COLLECTIONS = {
  DETECTIONS: 'detections',
  PRODUCTS: 'products',
  WALLET: 'wallet',
  TRANSACTIONS: 'transactions'
};

// Variables para almacenar las instancias
let firebaseApp = null;
let db = null;
let auth = null;
let storage = null;

// Función para inicializar Firebase con la configuración del backend
export const initializeFirebase = async () => {
  // Si ya está inicializado, retornar las instancias existentes
  if (firebaseApp) {
    return { firebaseApp, db, auth, storage };
  }
  
  try {
    // Obtener configuración del backend usando el endpoint que ya tienes
    const response = await fetch('http://localhost:5000/api/firebase-config');
    if (!response.ok) {
      throw new Error('No se pudo obtener la configuración de Firebase del backend');
    }
    
    const firebaseConfig = await response.json();
    
    // Inicializar Firebase
    firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
    storage = getStorage(firebaseApp);
    
    console.log('Firebase inicializado correctamente con configuración del backend');
    return { firebaseApp, db, auth, storage };
  } catch (error) {
    console.error('Error al inicializar Firebase:', error);
    throw error;
  }
};

// Funciones para acceder a las instancias (para uso en otros componentes)
export const getDb = () => db;
export const getFirebaseAuth = () => auth;
export const getFirebaseStorage = () => storage;
export const getFirebaseApp = () => firebaseApp;

// Exportar para mantener compatibilidad con código existente
export { db, firebaseApp, auth, storage };

export default {
  initializeFirebase,
  getDb,
  getFirebaseAuth,
  getFirebaseStorage,
  getFirebaseApp,
  COLLECTIONS
};