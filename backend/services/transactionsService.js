const { db } = require('../config/firebase');
const { collection, query, orderBy, limit, getDocs } = require('firebase/firestore');

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

module.exports = {
  getTransactions
};