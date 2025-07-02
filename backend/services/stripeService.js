const Stripe = require('stripe');
const Logger = require('../utils/logger.js');

class StripeService {
  constructor() {
    this.stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  }

  // Crear Payment Intent para pagos con tarjeta
  async createPaymentIntent(amount, currency = 'mxn', metadata = {}) {
    try {
      Logger.info(`Creando Payment Intent por ${amount} ${currency.toUpperCase()}`);
      
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe espera centavos
        currency: currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
        },
      });

      Logger.info(`Payment Intent creado: ${paymentIntent.id}`);
      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      };
    } catch (error) {
      Logger.error('Error creando Payment Intent:', error);
      throw new Error(`Error creando Payment Intent: ${error.message}`);
    }
  }

  // Confirmar pago
  async confirmPayment(paymentIntentId) {
    try {
      Logger.info(`Confirmando pago: ${paymentIntentId}`);
      
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      Logger.info(`Estado del pago: ${paymentIntent.status}`);
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convertir de centavos a pesos
        currency: paymentIntent.currency,
        created: new Date(paymentIntent.created * 1000),
        metadata: paymentIntent.metadata
      };
    } catch (error) {
      Logger.error('Error confirmando pago:', error);
      throw new Error(`Error confirmando pago: ${error.message}`);
    }
  }

  // Obtener información de un pago
  async getPayment(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        created: new Date(paymentIntent.created * 1000),
        metadata: paymentIntent.metadata,
        charges: paymentIntent.charges
      };
    } catch (error) {
      Logger.error('Error obteniendo pago:', error);
      throw new Error(`Error obteniendo pago: ${error.message}`);
    }
  }

  // Procesar webhook de Stripe
  async processWebhook(body, signature) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      Logger.info(`Webhook recibido: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          Logger.info('Pago exitoso:', event.data.object.id);
          break;
        case 'payment_intent.payment_failed':
          Logger.info('Pago fallido:', event.data.object.id);
          break;
        default:
          Logger.info(`Evento no manejado: ${event.type}`);
      }

      return { received: true, type: event.type, data: event.data };
    } catch (error) {
      Logger.error('Error procesando webhook:', error);
      throw new Error(`Error procesando webhook: ${error.message}`);
    }
  }

  // Crear cliente en Stripe
  async createCustomer(email, name, metadata = {}) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata
      });

      Logger.info(`Cliente creado: ${customer.id}`);
      return customer;
    } catch (error) {
      Logger.error('Error creando cliente:', error);
      throw new Error(`Error creando cliente: ${error.message}`);
    }
  }
}

module.exports = new StripeService();