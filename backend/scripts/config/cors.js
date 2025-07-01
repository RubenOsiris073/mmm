const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://psychic-bassoon-j65x4rxrvj4c5p54-3000.app.github.dev',
    process.env.CORS_ORIGIN
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

module.exports = corsOptions;