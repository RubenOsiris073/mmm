const { db } = require('../config/firebase');
const { collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp, where } = require('firebase/firestore');

// Obtener transacciones con un límite
const getTransactions = async (limitVal) => {
  try {
    const transactionsRef = collection(db, 'transactions');
    const q = query(transactionsRef, orderBy('timestamp', 'desc'), limit(limitVal));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return [];
    }
    
    const transactions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return transactions;
  } catch (error) {
    console.error("Error al obtener transacciones:", error);
    throw new Error("Error al obtener transacciones");
  }
};

// Obtener transacciones por userId
const getUserTransactions = async (userId, limitVal = 20) => {
  try {
    if (!userId) {
      throw new Error("Se requiere un userId para obtener las transacciones del usuario");
    }

    const transactionsRef = collection(db, 'transactions');
    const q = query(
      transactionsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitVal)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return [];
    }
    
    const transactions = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || data.timestamp
      };
    });
    
    return transactions;
  } catch (error) {
    console.error(`Error al obtener transacciones para usuario ${userId}:`, error);
    throw new Error(`Error al obtener transacciones del usuario: ${error.message}`);
  }
};

/**
 * Crear una nueva transacción de pago
 * @param {Object} transactionData - Datos de la transacción
 * @param {string} transactionData.userId - ID del usuario que realiza la transacción
 * @param {number} transactionData.amount - Monto de la transacción
 * @param {string} transactionData.type - Tipo de transacción (payment, refund, etc)
 * @param {string} transactionData.description - Descripción de la transacción
 * @param {string} transactionData.sessionId - ID de la sesión asociada (opcional)
 * @returns {Object} - La transacción creada con su ID
 */
const createTransaction = async (transactionData) => {
  try {
    console.log("Creando nueva transacción:", transactionData);
    
    const { userId, amount, type = 'payment', description, sessionId } = transactionData;
    
    if (!userId) {
      throw new Error("userId es requerido para crear una transacción");
    }
    
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error("Se requiere un monto válido mayor que cero");
    }
    
    const transactionsRef = collection(db, 'transactions');
    const newTransaction = {
      userId,
      amount: parseFloat(amount),
      type,
      description: description || `${type} de $${amount}`,
      sessionId,
      timestamp: serverTimestamp(),
      status: 'completed'
    };
    
    const docRef = await addDoc(transactionsRef, newTransaction);
    console.log(`Transacción creada con ID: ${docRef.id}`);
    
    return {
      id: docRef.id,
      ...newTransaction,
      timestamp: new Date().toISOString() // Convertir serverTimestamp a string ISO para la respuesta
    };
  } catch (error) {
    console.error("Error al crear transacción:", error);
    throw new Error(`Error al crear transacción: ${error.message}`);
  }
};

module.exports = {
  getTransactions,
  getUserTransactions,
  createTransaction
};