const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Firebase Admin se inicializa en middleware/auth.js
// Solo exportamos las referencias necesarias para el backend

// Definir las colecciones de Firebase
const COLLECTIONS = {
  PRODUCTS: 'products',
  INVENTORY: 'inventory',
  INVENTORY_MOVEMENTS: 'inventory_movements',
  SALES: 'sales',
  TRANSACTIONS: 'transactions',
  CARTS: 'carts',
  DETECTIONS: 'detections'
};

module.exports = {
  admin,
  COLLECTIONS
};