const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Configuración global de la aplicación
const config = {
  // Entorno de ejecución
  env: process.env.NODE_ENV || 'development',
  
  // Puerto para el servidor
  port: parseInt(process.env.PORT) || 5000,
  
  // Rutas importantes
  paths: {
    temp: path.join(__dirname, '..', 'temp'),
    models: path.join(__dirname, '..', 'models'),
    public: path.join(__dirname, '..', 'public'),
  },
  
  // Configuración de la webcam
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
  
  // Configuración de detección
  detection: {
    validLabels: ['Botella_Ciel_100ML', 'Cacahuates_Kiyakis_120G', 'Trident_13G', 'Del Valle_413ML', 'Pop_45G',
      'Dr.Peppe_335ML', 'Sabritas_150G', 'Takis_70G'],
    minConfidence: 70,
    defaultStock: 10
  },
  
  // Paginación y límites
  limits: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },
  
  // Modo debug
  debug: process.env.DEBUG === 'true'
};

module.exports = config;