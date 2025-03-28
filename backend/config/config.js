const path = require('path');
const dotenv = require('dotenv');

// Intentar cargar desde varias ubicaciones posibles
const envPaths = [
  './config/firebase.env',           // Relativo al directorio de trabajo
  path.join(__dirname, 'firebase.env'), // En la carpeta config
  '../firebase.env',                 // En la carpeta padre
  '../../firebase.env',              // En la carpeta raíz del proyecto
];

// Intentar cargar cada ruta hasta encontrar un archivo
let loaded = false;
for (const envPath of envPaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    console.log(`Variables de entorno cargadas desde: ${envPath}`);
    loaded = true;
    break;
  }
}

if (!loaded) {
  console.warn('No se encontró archivo firebase.env, intentando cargar .env estándar');
  dotenv.config(); // Intentar con el .env predeterminado
}

// Resto de tu configuración...
const config = {
  // Entorno de ejecución
  env: process.env.NODE_ENV || 'development',
  
  // Puerto para el servidor
  port: parseInt(process.env.PORT) || 5000,
  
  // Firebase (añadir verificación)
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  },
  
  // Rutas importantes
  paths: {
    temp: path.join(__dirname, '..', 'temp'),
    models: path.join(__dirname, '..', 'models'),
    public: path.join(__dirname, '..', 'public'),
  },
  
  // Resto de tu configuración...
  webcam: {
    width: 1280,
    height: 720,
    quality: 100,
    delay: 0,
    saveShots: true,
    output: "jpeg",
    device: false,
    callbackReturn: "location",
    verbose: false
  },
  
  detection: {
    validLabels: ['chicle', 'barrita', 'botella'],
    minConfidence: 70,
    defaultStock: 10
  },
  
  limits: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },
  
  debug: process.env.DEBUG === 'true'
};

// Verificar si las variables de Firebase están definidas
const missingVars = Object.entries(config.firebase)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.warn(`ADVERTENCIA: Variables de Firebase faltantes: ${missingVars.join(', ')}`);
}

module.exports = config;