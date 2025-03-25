// Importar módulos
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const NodeWebcam = require('node-webcam');

// Configurar Firebase
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where,
  orderBy, 
  limit,
  serverTimestamp, 
  increment 
} = require('firebase/firestore');

// Configurar variables de entorno
dotenv.config();

// Definir configuración de la cámara web
const Webcam = NodeWebcam.create({
  width: 1280,
  height: 720,
  quality: 100,
  delay: 0,
  saveShots: true,
  output: "jpeg",
  device: false,
  callbackReturn: "location",
  verbose: false
});

// Configurar Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

console.log("Firebase config:", {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey ? "***" : undefined // No mostrar la clave API completa
});

// Inicializar Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Definir colecciones
const PRODUCTS_COLLECTION = 'products';
const WALLET_COLLECTION = 'wallet';
const DETECTIONS_COLLECTION = 'detections';
const TRANSACTIONS_COLLECTION = 'transactions';
const SALES_COLLECTION = 'sales';

// Variable para seguimiento del modo de detección continua
let continuousDetectionMode = false;

// Configurar express
const app = express();

// Configurar middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Estado de la aplicación
let appState = {
  isRunning: true,
  lastDetection: null,
  continuousMode: false
};

// Función para procesar timestamps
function processTimestamp(timestamp) {
  if (!timestamp) return new Date().toISOString();
  
  try {
    if (typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toISOString();
    } else if (timestamp instanceof Date) {
      return timestamp.toISOString();
    } else if (typeof timestamp === 'string') {
      return timestamp;
    } else if (typeof timestamp === 'number') {
      return new Date(timestamp).toISOString();
    }
  } catch (e) {
    console.error("Error procesando timestamp:", e);
  }
  
  return new Date().toISOString();
}

// Función mejorada para actualizar el wallet/inventario
async function updateWallet(productIdOrLabel, adjustment) {
  try {
    console.log(`Actualizando wallet: ${productIdOrLabel} (${adjustment})`);
    
    // Intentar determinar el ID si se proporciona una etiqueta
    let productId = productIdOrLabel;
    if (!productIdOrLabel.startsWith('prod')) {
      const label = productIdOrLabel.toLowerCase();
      
      try {
        console.log(`Buscando producto con label: ${label}`);
        // Buscar producto por label
        const productsRef = collection(db, PRODUCTS_COLLECTION);
        const q = query(productsRef, where('label', '==', label));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          productId = querySnapshot.docs[0].id;
          console.log(`Producto encontrado por label: ${productId}`);
        } else {
          // Intentar buscar por nombre
          const nameQuery = query(productsRef, where('nombre', '==', label));
          const nameQuerySnapshot = await getDocs(nameQuery);
          
          if (!nameQuerySnapshot.empty) {
            productId = nameQuerySnapshot.docs[0].id;
            console.log(`Producto encontrado por nombre: ${productId}`);
          }
        }
      } catch (error) {
        console.error("Error buscando producto:", error);
        throw new Error(`No se pudo encontrar el producto con etiqueta: ${label}`);
      }
    }
    
    // Si no se encontró el producto, salir con error
    if (!productId) {
      console.log(`No se encontró el producto: ${productIdOrLabel}`);
      throw new Error(`Producto no encontrado: ${productIdOrLabel}`);
    }
    
    try {
      console.log(`Actualizando stock para producto ID: ${productId}`);
      // Actualizar en Firebase
      const walletRef = doc(db, WALLET_COLLECTION, productId);
      const walletDoc = await getDoc(walletRef);
      
      if (walletDoc.exists()) {
        // El producto ya existe en el wallet, actualizar cantidad
        const currentStock = walletDoc.data().cantidad || 0;
        const newStock = currentStock + adjustment;
        
        console.log(`Stock actual: ${currentStock}, Nuevo stock: ${newStock}`);
        
        if (newStock < 0) {
          console.log(`Error: Stock insuficiente para ${productId}`);
          throw new Error("Stock insuficiente");
        }
        
        await updateDoc(walletRef, {
          cantidad: increment(adjustment),
          updatedAt: serverTimestamp()
        });
        
        console.log(`Wallet actualizado correctamente para ${productId}`);
      } else {
        // El producto no existe en el wallet, buscarlo en products
        console.log(`Producto no encontrado en wallet, buscando en products...`);
        const productsRef = doc(db, PRODUCTS_COLLECTION, productId);
        const productDoc = await getDoc(productsRef);
        
        if (productDoc.exists()) {
          const productData = productDoc.data();
          await setDoc(walletRef, {
            id: productId,
            nombre: productData.nombre || productData.label,
            cantidad: adjustment > 0 ? adjustment : 0,
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp()
          });
          
          console.log(`Nuevo item creado en wallet para ${productId}`);
        } else {
          console.log(`Producto ${productId} no encontrado en la colección de productos`);
          throw new Error(`Producto ${productId} no existe en la base de datos`);
        }
      }
      
      // Registrar transacción
      const transRef = collection(db, TRANSACTIONS_COLLECTION);
      await addDoc(transRef, {
        productId,
        adjustment,
        timestamp: serverTimestamp()
      });
      
      console.log(`Transacción registrada para ${productId}`);
      
      // Obtener el valor actualizado
      const updatedWalletDoc = await getDoc(walletRef);
      if (updatedWalletDoc.exists()) {
        console.log(`Datos actualizados de wallet:`, updatedWalletDoc.data());
        return {
          ...updatedWalletDoc.data(),
          updatedAt: processTimestamp(updatedWalletDoc.data().updatedAt)
        };
      }
      
      throw new Error(`No se pudo verificar la actualización del wallet para ${productId}`);
    } catch (firestoreError) {
      console.error("Error de Firestore:", firestoreError);
      throw firestoreError;
    }
  } catch (error) {
    console.error("Error al actualizar wallet:", error);
    throw error;
  }
}

// Función para detectar objetos (simulación)
const detectObject = async (imagePath) => {
  // Esta es una versión simplificada. En un entorno real, aquí conectarías con un modelo de ML.
  // Para fines de demostración, devolvemos un resultado simulado basado en la hora actual
  const labels = ['botella', 'barrita', 'chicle'];
  
  // Usar el segundo actual para determinar la etiqueta de manera determinista para pruebas
  const second = new Date().getSeconds();
  const labelIndex = second % labels.length;
  
  // Determinar similaridad (valor alto para asegurar detecciones exitosas)
  const similarity = 75 + (second % 25);
  
  // Simular un tiempo de procesamiento para hacer más realista la detección
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return { 
    label: labels[labelIndex],
    similarity: similarity
  };
};

// Simulación de detección para pruebas o cuando falle la cámara
const simulateDetection = async () => {
  const mockDetections = [
    { label: 'botella', similarity: 97.54 },
    { label: 'barrita', similarity: 92.31 },
    { label: 'chicle', similarity: 89.76 },
    { label: 'jabon', similarity: 95.21 }
  ];
  
  // Elegir una detección aleatoria o basada en la hora para pruebas repetibles
  const index = new Date().getMinutes() % mockDetections.length;
  
  // Simular tiempo de procesamiento
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return mockDetections[index];
};

// Endpoints
// Health check
app.get('/health', (req, res) => {
  res.status(200).send({ status: 'OK', env: process.env.NODE_ENV });
});

// API Status
app.get('/api/status', (req, res) => {
  res.json({
    isRunning: appState.isRunning,
    continuousMode: continuousDetectionMode
  });
});

// Obtener productos
app.get('/api/products', async (req, res) => {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef);
    const querySnapshot = await getDocs(q);
    
    const products = [];
    querySnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({ products });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos", products: [] });
  }
});

// Crear producto
app.post('/api/products', async (req, res) => {
  try {
    const { nombre, precio, categoria, label } = req.body;
    
    // Validar datos
    if (!nombre || !precio) {
      return res.status(400).json({ error: "Nombre y precio son requeridos" });
    }
    
    // Crear documento
    const productData = {
      nombre,
      precio: parseFloat(precio),
      categoria: categoria || "",
      label: label || nombre.toLowerCase(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const docRef = await addDoc(productsRef, productData);
    
    res.status(201).json({ 
      id: docRef.id,
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

// Obtener wallet/inventario
app.get('/api/wallet', async (req, res) => {
  try {
    const walletRef = collection(db, WALLET_COLLECTION);
    const q = query(walletRef);
    const querySnapshot = await getDocs(q);
    
    const wallet = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      wallet.push({
        id: doc.id,
        ...data,
        // Asegurarse de que la cantidad sea un número
        cantidad: typeof data.cantidad === 'number' ? data.cantidad : 0,
        updatedAt: processTimestamp(data.updatedAt)
      });
    });
    
    console.log(`Obtenido wallet con ${wallet.length} items`);
    res.json({ wallet });
  } catch (error) {
    console.error("Error al obtener wallet:", error);
    res.status(500).json({ error: "Error al obtener wallet", wallet: [] });
  }
});

// Actualizar wallet
app.post('/api/wallet', async (req, res) => {
  try {
    const { productId, adjustment } = req.body;
    
    if (!productId || adjustment === undefined) {
      return res.status(400).json({ error: "ProductId y adjustment son requeridos" });
    }
    
    const result = await updateWallet(productId, parseInt(adjustment));
    
    res.json({
      success: true,
      product: result
    });
  } catch (error) {
    console.error("Error al actualizar wallet:", error);
    res.status(500).json({ error: error.message || "Error al actualizar wallet" });
  }
});

// Endpoint mejorado para detección
app.post('/api/detect', async (req, res) => {
  try {
    console.log("Solicitud de detección recibida");
    
    let detection;
    // Intentar usar la cámara, si falla usar simulación
    try {
      const imagePath = path.join(__dirname, 'temp', `capture-${Date.now()}.jpg`);
      
      // Crear directorio si no existe
      if (!fs.existsSync(path.join(__dirname, 'temp'))) {
        fs.mkdirSync(path.join(__dirname, 'temp'), { recursive: true });
      }
      
      // Capturar imagen
      await new Promise((resolve, reject) => {
        Webcam.capture(imagePath, (err, data) => {
          if (err) {
            console.log("Error con cámara, usando simulación");
            reject(err);
            return;
          }
          resolve(data);
        });
      });
      
      // Detectar objeto
      detection = await detectObject(imagePath);
      
      // Limpiar imagen
      fs.unlink(imagePath, () => {});
      
    } catch (cameraError) {
      console.log("Usando detección simulada debido a error:", cameraError);
      detection = await simulateDetection();
    }
    
    console.log("Detección completada:", detection);
    
    // Buscar información completa del producto
    let productInfo = null;
    try {
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      const q = query(productsRef, where('label', '==', detection.label));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        
        // Obtener información del stock desde wallet
        let stock = 0;
        try {
          const walletRef = doc(db, WALLET_COLLECTION, doc.id);
          const walletDoc = await getDoc(walletRef);
          if (walletDoc.exists()) {
            stock = walletDoc.data().cantidad || 0;
          }
        } catch (walletError) {
          console.error("Error al obtener stock:", walletError);
        }
        
        productInfo = {
          id: doc.id,
          ...doc.data(),
          stock: stock
        };
        console.log("Información de producto encontrada:", productInfo);
      } else {
        console.log("No se encontró información del producto en la base de datos");
      }
    } catch (dbError) {
      console.error("Error buscando producto en la base de datos:", dbError);
    }
    
    // Guardar en Firestore
    const detectionData = {
      label: detection.label,
      similarity: detection.similarity,
      timestamp: serverTimestamp(),
      productInfo: productInfo // Incluir info del producto
    };
    
    const detectionsRef = collection(db, DETECTIONS_COLLECTION);
    const docRef = await addDoc(detectionsRef, detectionData);
    
    // Actualizar estado de la aplicación
    appState.lastDetection = {
      id: docRef.id,
      ...detection,
      timestamp: new Date().toISOString(),
      productInfo: productInfo
    };
    
    // Responder con toda la información
    res.json({
      success: true,
      detection: {
        id: docRef.id,
        ...detection,
        productInfo: productInfo,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error("Error en detección:", error);
    res.status(500).json({ error: "Error en detección" });
  }
});

// Obtener detecciones
app.get('/api/detections', async (req, res) => {
  try {
    const limitParam = parseInt(req.query.limit) || 10;
    const detectionsRef = collection(db, DETECTIONS_COLLECTION);
    const q = query(detectionsRef, orderBy('timestamp', 'desc'), limit(limitParam));
    const querySnapshot = await getDocs(q);
    
    const detections = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      detections.push({
        id: doc.id,
        ...data,
        timestamp: processTimestamp(data.timestamp)
      });
    });
    
    res.json({ detections });
  } catch (error) {
    console.error("Error al obtener detecciones:", error);
    res.status(500).json({ error: "Error al obtener detecciones", detections: [] });
  }
});

// Obtener estado de detección continua
app.get('/api/detection-mode', (req, res) => {
  res.json({
    active: continuousDetectionMode
  });
});

// Cambiar modo de detección
app.post('/api/detection-mode', (req, res) => {
  const { active } = req.body;
  
  if (typeof active !== 'boolean') {
    return res.status(400).json({ error: "El parámetro 'active' debe ser un booleano" });
  }
  
  continuousDetectionMode = active;
  appState.continuousMode = active;
  
  res.json({
    active: continuousDetectionMode,
    message: active ? "Modo de detección continua activado" : "Modo de detección continua desactivado"
  });
});

// Obtener ventas
app.get('/api/sales', async (req, res) => {
  try {
    const salesRef = collection(db, SALES_COLLECTION);
    const q = query(salesRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const sales = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      sales.push({
        id: doc.id,
        ...data,
        timestamp: processTimestamp(data.timestamp)
      });
    });
    
    res.json({ sales });
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    res.status(500).json({ error: "Error al obtener ventas", sales: [] });
  }
});

// Crear venta
app.post('/api/sales', async (req, res) => {
  try {
    const { items, total, paymentMethod, amountReceived, change, clientName } = req.body;
    
    // Validar datos
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Se requieren productos en la venta" });
    }
    
    // Crear documento de venta
    const saleData = {
      items,
      total,
      paymentMethod,
      amountReceived,
      change,
      clientName: clientName || "Cliente General",
      timestamp: serverTimestamp()
    };
    
    // Guardar en Firestore
    const salesRef = collection(db, SALES_COLLECTION);
    const docRef = await addDoc(salesRef, saleData);
    
    console.log("Venta creada correctamente, actualizando inventario...");
    
    // Actualizar inventario
    try {
      for (const item of items) {
        await updateWallet(item.id, -item.quantity);
      }
      console.log("Inventario actualizado con éxito");
    } catch (walletError) {
      console.error("Error actualizando inventario:", walletError);
      // No fallar la venta, pero registrar el error
    }
    
    res.json({ 
      success: true, 
      saleId: docRef.id 
    });
  } catch (error) {
    console.error("Error al crear venta:", error);
    res.status(500).json({ error: "Error al crear venta" });
  }
});

// Obtener transacciones
app.get('/api/transactions', async (req, res) => {
  try {
    const transRef = collection(db, TRANSACTIONS_COLLECTION);
    const q = query(transRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const transactions = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      transactions.push({
        id: doc.id,
        ...data,
        timestamp: processTimestamp(data.timestamp)
      });
    });
    
    res.json({ transactions });
  } catch (error) {
    console.error("Error al obtener transacciones:", error);
    res.status(500).json({ error: "Error al obtener transacciones", transactions: [] });
  }
});

// Ruta para servir archivos estáticos (si es necesario)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Puerto de escucha
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Modo: ${process.env.NODE_ENV || 'desarrollo'}`);
});

// Exportar para testing (opcional)
module.exports = app;