// cartSyncService.js - Servicio para sincronización entre POS web y aplicación móvil
const crypto = require('crypto');
const cartService = require('./cartService');
const transactionsService = require('./transactionsService');

// Almacén en memoria de carritos sincronizados (en producción usar Redis o similar)
const syncedCarts = new Map();
const shortCodeToSessionId = new Map();

// Generar un código alfanumérico de 6 caracteres que sea fácil de escribir
const generateShortCode = () => {
  // Caracteres que son fáciles de distinguir visualmente (excluimos 0, O, 1, I, etc.)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  
  return result;
};

// Crear una nueva sesión de sincronización
const createSyncSession = (cart) => {
  const sessionId = crypto.randomUUID();
  const shortCode = generateShortCode();
  
  const syncData = {
    sessionId,
    shortCode,
    items: cart.items || [],
    total: cart.total || 0,
    status: 'pending', // pending, paid, expired
    createdAt: new Date().toISOString(),
    updated: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000) // Expira en 30 minutos
  };
  
  syncedCarts.set(sessionId, syncData);
  shortCodeToSessionId.set(shortCode, sessionId);
  
  // Programar la limpieza automática después de que expire
  setTimeout(() => {
    if (syncedCarts.has(sessionId)) {
      const data = syncedCarts.get(sessionId);
      if (data.status === 'pending') {
        data.status = 'expired';
        syncedCarts.set(sessionId, data);
      }
    }
    // Limpiar después de 1 hora
    setTimeout(() => {
      syncedCarts.delete(sessionId);
      shortCodeToSessionId.delete(shortCode);
    }, 30 * 60 * 1000);
  }, 30 * 60 * 1000); // 30 minutos
  
  return { sessionId, shortCode };
};

// Obtener un carrito sincronizado por ID de sesión o código corto
const getSyncedCart = (identifier) => {
  // Primero intentar usar el identificador como sessionId
  if (syncedCarts.has(identifier)) {
    return syncedCarts.get(identifier);
  }
  
  // Luego intentar usar el identificador como código corto
  const sessionId = shortCodeToSessionId.get(identifier.toUpperCase());
  if (sessionId && syncedCarts.has(sessionId)) {
    return syncedCarts.get(sessionId);
  }
  
  return null;
};

// Actualizar un carrito sincronizado
const updateSyncedCart = (identifier, cart) => {
  let sessionId = identifier;
  
  // Verificar si es un código corto
  if (!syncedCarts.has(identifier)) {
    sessionId = shortCodeToSessionId.get(identifier.toUpperCase());
    if (!sessionId) return null;
  }
  
  if (!syncedCarts.has(sessionId)) return null;
  
  const syncData = syncedCarts.get(sessionId);
  syncData.items = cart.items || [];
  syncData.total = cart.total || 0;
  syncData.updated = new Date().toISOString();
  
  syncedCarts.set(sessionId, syncData);
  return syncData;
};

// Procesar el pago de un carrito sincronizado
const processPayment = async (identifier, paymentInfo) => {
  let sessionId = identifier;
  
  // Verificar si es un código corto
  if (!syncedCarts.has(identifier)) {
    sessionId = shortCodeToSessionId.get(identifier.toUpperCase());
    if (!sessionId) throw new Error('Carrito no encontrado');
  }
  
  const syncData = syncedCarts.get(sessionId);
  if (!syncData) throw new Error('Carrito no encontrado');
  
  if (syncData.status !== 'pending') {
    throw new Error(`El carrito ya fue ${syncData.status}`);
  }
  
  try {
    // Crear una transacción utilizando el servicio de transacciones existente
    const orderData = {
      items: syncData.items,
      total: syncData.total,
      paymentMethod: paymentInfo.method,
      paymentInfo: paymentInfo
    };
    
    // Registrar la transacción
    const transaction = await transactionsService.createTransaction(orderData);
    
    // Actualizar el estado del carrito sincronizado
    syncData.status = 'paid';
    syncData.transactionId = transaction.id || transaction._id;
    syncData.paidAt = new Date().toISOString();
    syncedCarts.set(sessionId, syncData);
    
    return {
      success: true,
      message: 'Pago procesado con éxito',
      paymentInfo: paymentInfo,
      orderId: transaction.id || transaction._id,
      sessionId: sessionId
    };
  } catch (error) {
    console.error('Error al procesar el pago:', error);
    syncData.status = 'failed';
    syncData.error = error.message;
    syncedCarts.set(sessionId, syncData);
    throw new Error('No se pudo procesar el pago: ' + error.message);
  }
};

// Limpiar sesiones expiradas periódicamente
const cleanupExpiredSessions = () => {
  const now = new Date();
  
  for (const [sessionId, data] of syncedCarts.entries()) {
    if (new Date(data.expiresAt) < now && data.status === 'pending') {
      data.status = 'expired';
      syncedCarts.set(sessionId, data);
    }
    
    // Eliminar sesiones muy antiguas (más de 2 horas)
    if (new Date(data.createdAt).getTime() + (2 * 60 * 60 * 1000) < now.getTime()) {
      const shortCode = data.shortCode;
      syncedCarts.delete(sessionId);
      if (shortCode) {
        shortCodeToSessionId.delete(shortCode);
      }
    }
  }
};

// Configurar limpieza periódica cada 5 minutos
setInterval(cleanupExpiredSessions, 5 * 60 * 1000);

module.exports = {
  createSyncSession,
  getSyncedCart,
  updateSyncedCart,
  processPayment,
  generateShortCode
};