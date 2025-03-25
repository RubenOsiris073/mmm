// Importa las funciones necesarias del SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyALafcLIe2JfBAYpvhphPzWpvNRAE5AYDg",
  authDomain: "fkaw2-6c776.firebaseapp.com",
  databaseURL: "https://fkaw2-6c776-default-rtdb.firebaseio.com",
  projectId: "fkaw2-6c776",
  storageBucket: "fkaw2-6c776.firebasestorage.app",
  messagingSenderId: "219203089904",
  appId: "1:219203089904:web:51f0b8ededfad2e92d1935"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa servicios
const db = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);

export { db, storage, rtdb };