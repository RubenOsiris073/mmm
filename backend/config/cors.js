const corsOptions = {
  origin: '*', // Allow requests from any origin (TEMPORARY FOR TESTING)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false,
  // Note: Using '*' with credentials: true is generally discouraged
  // for production due to security risks. This is for testing only.
};

module.exports = corsOptions;