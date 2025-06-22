const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');
const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Configuración Firebase para autenticación
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Inicializar Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// Definir las colecciones de Firebase
const COLLECTIONS = {
  PRODUCTS: 'products',
  INVENTORY: 'inventory',
  INVENTORY_MOVEMENTS: 'inventory_movements',
  SALES: 'sales',
  TRANSACTIONS: 'transactions',
  CARTS: 'carts',
  DETECTIONS: 'detections'
};

module.exports = {
  firebaseConfig,
  auth,
  admin,
  db,
  COLLECTIONS
};