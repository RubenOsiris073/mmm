const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

// Intentar cargar desde múltiples ubicaciones
const envPaths = [
  path.join(__dirname, '..', '.env'),
  path.join(process.cwd(), '.env'),
  '/.env',
  './.env'
];

let envLoaded = false;

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    console.log(`Cargando variables de entorno desde: ${envPath}`);
    dotenv.config({ path: envPath });
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  dotenv.config();
}

// Configuración Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

console.log("Firebase config:", {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey ? "***" : undefined
});

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Definir colecciones
const COLLECTIONS = {
  PRODUCTS: 'products',
  INVENTORY: 'inventory',           
  INVENTORY_MOVEMENTS: 'inventory_movements', 
  DETECTIONS: 'detections',
  TRANSACTIONS: 'transactions',
  SALES: 'sales'
};

module.exports = {
  db,
  COLLECTIONS,
  firebaseApp: app
};