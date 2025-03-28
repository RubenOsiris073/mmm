import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuración de Firebase usando variables de entorno
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Validar que las variables existan
const missingVars = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error(`Error: Variables de entorno faltantes: ${missingVars.join(', ')}`);
  console.error('Verifica tu archivo .env y asegúrate de que estás usando el prefijo correcto (REACT_APP_ o VITE_)');
}

// Inicializar Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

// Colecciones de Firestore
export const COLLECTIONS = {
  DETECTIONS: 'detections',
  PRODUCTS: 'products',
  WALLET: 'wallet',
  TRANSACTIONS: 'transactions'
};

// Exportar todo lo necesario
export default {
  db,
  firebaseApp,
  storage,
  COLLECTIONS
};