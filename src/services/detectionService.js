import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// Función para registrar la predicción en Firestore
export const logPrediction = async (label, similarity) => {
  try {
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