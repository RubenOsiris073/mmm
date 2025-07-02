const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');
const { DoubleEncryptionManager } = require('../scripts/doubleEncryption');
const Logger = require('../utils/logger');

dotenv.config();

class FirebaseManager {
  constructor() {
    this._isInitialized = false;
    this._admin = null;
    this._db = null;
  }

  /**
   * Inicializar Firebase Admin de forma segura
   */
  async initialize() {
    if (this._isInitialized) {
      return this._admin;
    }

    try {
      Logger.startOperation('Firebase Admin Initialization');
      
      // Cargar credenciales encriptadas
      const manager = new DoubleEncryptionManager();
      const masterPassword = process.env.MASTER_ENCRYPTION_KEY;
      
      const credentialsPath = path.join(__dirname, 'db-auth-config.double-encrypted.json');
      Logger.debug('Buscando credenciales encriptadas', { path: credentialsPath });
      
      const firebaseCredentials = manager.loadAndDecryptCredentials(
        credentialsPath,
        masterPassword
      );
      
      Logger.success('Credenciales de Firebase desencriptadas exitosamente');
      
      // Inicializar Firebase Admin
      this._admin = admin.initializeApp({
        credential: admin.credential.cert(firebaseCredentials),
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
      
      // Inicializar Firestore
      this._db = this._admin.firestore();
      this._isInitialized = true;
      
      Logger.success('Firebase Admin inicializado correctamente', { 
        projectId: firebaseCredentials.project_id 
      });
      Logger.endOperation('Firebase Admin Initialization', true);
      return this._admin;
      
    } catch (error) {
      Logger.error('Error en credenciales encriptadas', { error: error.message });
      Logger.warn('Intentando configuración básica como fallback');
      
      try {
        // Fallback: configuración básica
        this._admin = admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID,
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET
        });
        
        this._db = this._admin.firestore();
        this._isInitialized = true;
        
        Logger.warn('Firebase inicializado con configuración básica (sin credenciales)');
        Logger.endOperation('Firebase Admin Initialization', true);
        return this._admin;
        
      } catch (fallbackError) {
        Logger.error('Error crítico en Firebase - Inicialización fallida', { 
          error: fallbackError.message 
        });
        Logger.endOperation('Firebase Admin Initialization', false);
        throw new Error('No se pudo inicializar Firebase Admin');
      }
    }
  }

  /**
   * Obtener instancia de Firebase Admin
   */
  getAdmin() {
    if (!this._isInitialized) {
      throw new Error('Firebase no está inicializado. Llama a initialize() primero.');
    }
    return this._admin;
  }

  /**
   * Obtener instancia de Firestore
   */
  getFirestore() {
    if (!this._isInitialized) {
      throw new Error('Firebase no está inicializado. Llama a initialize() primero.');
    }
    return this._db;
  }

  /**
   * Verificar si Firebase está inicializado
   */
  isInitialized() {
    return this._isInitialized;
  }
}

// Exportar instancia única (singleton)
const firebaseManager = new FirebaseManager();

module.exports = {
  firebaseManager,
  admin, // Exportar admin para compatibilidad
  COLLECTIONS: {
    PRODUCTS: 'products',
    INVENTORY: 'inventory',
    INVENTORY_MOVEMENTS: 'inventory_movements',
    SALES: 'sales',
    TRANSACTIONS: 'transactions',
    CARTS: 'carts',
    DETECTIONS: 'detections'
  }
};
