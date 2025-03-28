const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { initializeInventory } = require('./services/inventoryService');
const config = require('./config/config'); // Ruta corregida

// Importar rutas
const productRoutes = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const detectionRoutes = require('./routes/detectionRoutes');
const salesRoutes = require('./routes/salesRoutes');

// Configurar express
const app = express();

// Configurar middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).send({ status: 'OK', env: config.env });
});

// API Status
app.get('/api/status', (req, res) => {
  res.json({
    isRunning: true,
    version: '1.0.0',
    environment: config.env
  });
});

// Registrar rutas API
app.use('/api', productRoutes);
app.use('/api', inventoryRoutes);
app.use('/api', detectionRoutes);
app.use('/api', salesRoutes);

// Ruta para servir archivos estáticos (si es necesario)
if (config.env === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Inicializar datos necesarios
(async () => {
  try {
    console.log("Inicializando inventario...");
    await initializeInventory();
  } catch (error) {
    console.error("Error en inicialización:", error);
  }
})();

// Puerto de escucha
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Modo: ${config.env}`);
});

// Exportar para testing (opcional)
module.exports = app;