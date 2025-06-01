import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';

// Colecciones de Firebase
export const COLLECTIONS = {
  PRODUCTS: 'products',
  SALES: 'sales',
  INVENTORY: 'inventory',
  TRANSACTIONS: 'transactions',
};

// Variable para almacenar la app inicializada
let firebaseApp = null;
let db = null;

// Función para obtener la instancia de Firestore
export const getDb = () => {
  if (!db && firebaseApp) {
    db = getFirestore(firebaseApp);
  }
  return db;
};

// Exportamos la instancia de db para compatibilidad
export { db };

// Configuración de Firebase desde variables de entorno
export const initializeFirebase = async () => {
  try {
    if (firebaseApp) {
      console.log('Firebase ya está inicializado');
      return firebaseApp;
    }

    const firebaseConfig = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID,
    };

    console.log('Inicializando Firebase con proyecto:', firebaseConfig.projectId);
    
    firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);
    
    console.log('Firebase inicializado correctamente');
    return firebaseApp;
  } catch (error) {
    console.error("Error al inicializar Firebase:", error);
    throw error;
  }
};

const firebaseService = {
  getCollection: (collectionName) => collection(db || getDb(), collectionName),
  getDocument: (collectionName, documentId) => doc(db || getDb(), collectionName, documentId),
  addDocument: (collectionName, data) => addDoc(collection(db || getDb(), collectionName), data),
  updateDocument: (collectionName, documentId, data) => updateDoc(doc(db || getDb(), collectionName, documentId), data),
  deleteDocument: (collectionName, documentId) => deleteDoc(doc(db || getDb(), collectionName, documentId)),
  getDocuments: async (collectionName) => {
    const snapshot = await getDocs(collection(db || getDb(), collectionName));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

export default firebaseService;