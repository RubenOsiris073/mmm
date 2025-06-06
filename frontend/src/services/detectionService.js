import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "./firebase";  // Importamos la función para obtener db en lugar de importar db directamente

// Función para registrar la predicción en Firestore
export const logPrediction = async (label, similarity) => {
  try {
    const db = getDb();  // Obtenemos la instancia de db
    
    // Verificamos que db esté inicializado
    if (!db) {
      console.error("Firestore no está inicializado. Asegúrate de llamar a initializeFirebase primero.");
      return;
    }
    
    await addDoc(collection(db, "predicciones"), {
      label,
      similarity: parseFloat(similarity),
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Error al registrar la predicción:", error);
  }
};

// Función para guardar un producto en Firestore
export const addProduct = async (productData) => {
  try {
    const db = getDb();  // Obtenemos la instancia de db
    
    // Verificamos que db esté inicializado
    if (!db) {
      console.error("Firestore no está inicializado. Asegúrate de llamar a initializeFirebase primero.");
      throw new Error("Firebase no inicializado");
    }
    
    const docRef = await addDoc(collection(db, "productos"), {
      ...productData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error al guardar el producto:", error);
    throw error;
  }
};