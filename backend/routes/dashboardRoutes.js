const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Las rutas del dashboard no necesitan autenticación de usuario
// Usan Service Account para Google Sheets

// GET /api/dashboard/metrics - Obtener métricas del dashboard
router.get('/metrics', dashboardController.getMetrics);

// GET /api/dashboard/sales-data - Obtener datos de ventas desde Google Sheets
router.get('/sales-data', dashboardController.getSalesData);

module.exports = router;