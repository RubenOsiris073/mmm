import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeAuth,
  getReactNativePersistence,
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de Firebase usando variables de entorno
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Validar que todas las variables de entorno estén presentes
const requiredEnvVars = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Variables de entorno de Firebase faltantes:', missingVars);
  console.log('📋 Variables de entorno disponibles:', Object.keys(process.env).filter(key => key.startsWith('EXPO_PUBLIC_FIREBASE')));
}

// Variables globales para las instancias
let app = null;
let auth = null;
let db = null;

// Función para inicializar Firebase de manera limpia
export const initializeFirebase = async () => {
  try {
    console.log('🔥 Iniciando inicialización de Firebase...');
    console.log('📊 Proyecto:', firebaseConfig.projectId);
    
    // Limpiar cualquier instancia existente si hay errores
    const existingApps = getApps();
    if (existingApps.length > 0) {
      console.log('📱 Usando app Firebase existente');
      app = existingApps[0];
    } else {
      console.log('🆕 Creando nueva app Firebase');
      app = initializeApp(firebaseConfig);
    }

    // Inicializar Auth SOLO con initializeAuth para React Native
    if (!auth) {
      console.log('🔐 Inicializando Auth con AsyncStorage...');
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
      console.log('✅ Auth inicializado correctamente');
    }

    // Inicializar Firestore
    if (!db) {
      console.log('🗄️ Inicializando Firestore...');
      db = getFirestore(app);
      console.log('✅ Firestore inicializado correctamente');
    }

    console.log('🎉 Firebase completamente inicializado');
    
    return app;
  } catch (error) {
    console.error('❌ Error al inicializar Firebase:', error);
    console.error('📋 Detalles del error:', error.message);
    throw error;
  }
};

// Servicios de autenticación simplificados
export const authService = {
  // Login con email y password
  signInWithEmail: async (email, password) => {
    try {
      if (!auth) {
        throw new Error('🚫 Firebase Auth no inicializado');
      }
      console.log('🔑 Intentando login con:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login exitoso:', result.user.email);
      return result;
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  },

  // Cerrar sesión
  signOut: async () => {
    try {
      if (!auth) {
        throw new Error('🚫 Firebase Auth no inicializado');
      }
      await signOut(auth);
      console.log('👋 Sesión cerrada exitosamente');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      throw error;
    }
  },

  // Observador de estado de autenticación
  onAuthStateChanged: (callback) => {
    if (!auth) {
      console.warn('⚠️ Firebase Auth no inicializado para listener');
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    if (!auth) {
      console.warn('⚠️ Firebase Auth no inicializado para getCurrentUser');
      return null;
    }
    return auth.currentUser;
  }
};

export default authService;