const express = require('express');
const router = express.Router();
const stripeService = require('../services/stripeService');

// Crear Payment Intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'mxn', metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'El monto debe ser mayor a 0'
      });
    }

    console.log(`Solicitud de Payment Intent - Monto: $${amount}`);

    const paymentIntent = await stripeService.createPaymentIntent(amount, currency, metadata);

    res.json({
      success: true,
      data: paymentIntent
    });

  } catch (error) {
    console.error('Error en /create-payment-intent:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Confirmar pago
router.post('/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment Intent ID es requerido'
      });
    }

    console.log(`Confirmando pago: ${paymentIntentId}`);

    const payment = await stripeService.confirmPayment(paymentIntentId);

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Error en /confirm-payment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Obtener información de un pago
router.get('/payment/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    console.log(`Obteniendo información del pago: ${paymentIntentId}`);

    const payment = await stripeService.getPayment(paymentIntentId);

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Error en /payment/:id:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Webhook de Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).send('Missing Stripe signature');
    }

    const event = await stripeService.processWebhook(req.body, signature);

    res.json({ received: true });

  } catch (error) {
    console.error('Error en webhook:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Crear cliente
router.post('/create-customer', async (req, res) => {
  try {
    const { email, name, metadata = {} } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email es requerido'
      });
    }

    console.log(`Creando cliente: ${email}`);

    const customer = await stripeService.createCustomer(email, name, metadata);

    res.json({
      success: true,
      data: customer
    });

  } catch (error) {
    console.error('Error en /create-customer:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;