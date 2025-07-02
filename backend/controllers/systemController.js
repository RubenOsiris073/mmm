const config = require('../config/config');
const { firebaseManager } = require('../config/firebaseManager');

/**
 * Endpoint de salud del sistema
 */
const healthCheck = (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: config.env,
    endpoints: {
      system: ['/api/health', '/api/status', '/api/firebase-config'],
      auth: ['/api/auth/login', '/api/auth/verify', '/api/auth/logout'],
      products: ['/api/products', '/api/products/:id'],
      inventory: ['/api/inventory', '/api/inventory/movements', '/api/inventory/summary'],
      detection: ['/api/detection', '/api/detection/capture'],
      sales: ['/api/sales', '/api/sales/:id'],
      transactions: ['/api/transactions', '/api/transactions/:id'],
      cart: ['/api/cart', '/api/cart/:id'],
      stripe: ['/api/stripe/create-payment-intent', '/api/stripe/webhook']
    },
    server: {
      started: req.app.locals.startTime || new Date().toISOString(),
      uptime: `${Math.floor((new Date() - (req.app.locals.startTime || new Date())) / 1000 / 60)} minutos`
    }
  });
};

/**
 * Estado del servidor
 */
const serverStatus = (req, res) => {
  res.json({
    isRunning: true,
    version: '1.0.0',
    environment: config.env,
    timestamp: new Date().toISOString(),
    serverStarted: req.app.locals.startTime || new Date().toISOString(),
    uptime: `${Math.floor((new Date() - (req.app.locals.startTime || new Date())) / 1000 / 60)} minutos`
  });
};

module.exports = {
  healthCheck,
  serverStatus
};