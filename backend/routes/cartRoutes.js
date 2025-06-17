const express = require('express');
const router = express.Router();
const cartService = require('../services/cartService');
const cartSyncService = require('../services/cartSyncService');

/**
 * @route POST /api/cart
 * @desc Crea un nuevo carrito compartido
 */
router.post('/', async (req, res) => {
  try {
    const cartData = req.body;
    const newCart = await cartService.createCart(cartData);
    
    res.status(201).json({
      success: true,
      data: newCart
    });
  } catch (error) {
    console.error('Error en POST /cart:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear el carrito'
    });
  }
});

/**
 * @route GET /api/cart/:sessionId
 * @desc Obtiene un carrito por ID de sesión (tanto de cartService como de cartSyncService)
 */
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    console.log(`🔍 Consultando carrito con sessionId: ${sessionId}`);
    
    // Primero intentar obtener del servicio de sincronización (carritos temporales)
    const syncedCart = cartSyncService.getSyncedCart(sessionId);
    
    if (syncedCart) {
      console.log(`✅ Carrito encontrado en cartSyncService - Estado: ${syncedCart.status}`);
      return res.status(200).json({
        success: true,
        data: syncedCart
      });
    }
    
    console.log(`⚠️ Carrito NO encontrado en cartSyncService, buscando en cartService...`);
    
    // Si no se encuentra en sync, buscar en el servicio persistente
    const cart = await cartService.getCartBySessionId(sessionId);
    
    if (!cart) {
      console.log(`❌ Carrito NO encontrado en ningún servicio`);
      return res.status(404).json({
        success: false,
        error: `No se encontró un carrito con sessionId: ${sessionId}`
      });
    }
    
    console.log(`✅ Carrito encontrado en cartService`);
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error(`Error en GET /cart/${req.params.sessionId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el carrito'
    });
  }
});

/**
 * @route PATCH /api/cart/:sessionId/status
 * @desc Actualiza el estado de un carrito
 */
router.patch('/:sessionId/status', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const statusData = req.body;
    
    const updatedCart = await cartService.updateCartStatus(sessionId, statusData);
    
    res.status(200).json({
      success: true,
      data: updatedCart
    });
  } catch (error) {
    console.error(`Error en PATCH /cart/${req.params.sessionId}/status:`, error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el estado del carrito'
    });
  }
});

/**
 * @route POST /api/cart/:sessionId/payment
 * @desc Procesa el pago de un carrito
 */
router.post('/:sessionId/payment', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const paymentData = req.body;
    
    const processedCart = await cartService.processPayment(sessionId, paymentData);
    
    res.status(200).json({
      success: true,
      data: processedCart
    });
  } catch (error) {
    console.error(`Error en POST /cart/${req.params.sessionId}/payment:`, error);
    res.status(500).json({
      success: false,
      error: 'Error al procesar el pago'
    });
  }
});

/**
 * @route POST /api/cart/sync
 * @desc Crear una sesión de sincronización para el móvil
 */
router.post('/sync', async (req, res) => {
  try {
    const cartData = req.body; // { items, total }
    const { sessionId, shortCode } = cartSyncService.createSyncSession(cartData);
    
    res.status(201).json({
      success: true,
      data: {
        sessionId,
        shortCode,
        message: 'Sesión de sincronización creada exitosamente'
      }
    });
  } catch (error) {
    console.error('Error al crear sesión de sincronización:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear la sesión de sincronización'
    });
  }
});

/**
 * @route POST /api/cart/sync/:code
 * @desc Sincronizar carrito usando código corto desde la app móvil
 */
router.post('/sync/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { userId } = req.body;
    
    const syncedCart = cartSyncService.getSyncedCart(code);
    
    if (!syncedCart) {
      return res.status(404).json({
        success: false,
        error: 'Código de sincronización no válido o expirado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        items: syncedCart.items,
        total: syncedCart.total,
        sessionId: syncedCart.sessionId
      }
    });
  } catch (error) {
    console.error('Error al sincronizar carrito:', error);
    res.status(500).json({
      success: false,
      error: 'Error al sincronizar el carrito'
    });
  }
});

/**
 * @route POST /api/cart/process-payment
 * @desc Procesar pago desde la app móvil
 */
router.post('/process-payment', async (req, res) => {
  try {
    const { sessionId, userId, amount } = req.body;
    
    const paymentInfo = {
      method: 'wallet',
      userId: userId,
      amount: amount,
      timestamp: new Date().toISOString()
    };
    
    const result = await cartSyncService.processPayment(sessionId, paymentInfo);
    
    res.status(200).json({
      success: true,
      data: {
        transactionId: result.orderId,
        message: 'Pago procesado exitosamente'
      }
    });
  } catch (error) {
    console.error('Error al procesar pago:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al procesar el pago'
    });
  }
});

module.exports = router;