const express = require('express');
const router = express.Router();
const detectionService = require('../services/detectionService');

// Realizar una detección
router.post('/detect', async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ 
        error: "Se requiere una imagen para la detección" 
      });
    }

    const detection = await detectionService.performDetection(image);
    res.json({
      success: true,
      detection
    });
  } catch (error) {
    console.error("Error en detección:", error);
    res.status(500).json({ 
      error: "Error en detección",
      details: error.message 
    });
  }
});

// Obtener detecciones recientes
router.get('/detections', async (req, res) => {
  try {
    const limitParam = parseInt(req.query.limit) || 10;
    const detections = await detectionService.getRecentDetections(limitParam);
    res.json({ detections });
  } catch (error) {
    console.error("Error al obtener detecciones:", error);
    res.status(500).json({ error: "Error al obtener detecciones", detections: [] });
  }
});

// Obtener estado de detección
router.get('/detection-mode', (req, res) => {
  res.json(detectionService.getDetectionMode());
});

// Cambiar modo de detección
router.post('/detection-mode', (req, res) => {
  const { active } = req.body;
  
  if (typeof active !== 'boolean') {
    return res.status(400).json({ error: "El parámetro 'active' debe ser un booleano" });
  }
  
  const result = detectionService.setDetectionMode(active);
  res.json({
    ...result,
    message: result.active ? "Modo de detección continua activado" : "Modo de detección continua desactivado"
  });
});

// Consultar estado de detección continua
router.get('/detection/continuous/status', async (req, res) => {
  try {
    const status = await detectionService.getDetectionStatus();
    res.json(status);
  } catch (error) {
    console.error("Error al obtener estado de detección continua:", error);
    res.status(500).json({ error: "Error al obtener estado de detección continua" });
  }
});

// Configuración de detección continua
router.post('/detection/continuous', async (req, res) => {
  try {
    const { active, intervalMs } = req.body;
    const result = await detectionService.setDetectionMode(active, intervalMs);
    res.json(result);
  } catch (error) {
    console.error("Error al configurar modo de detección continua:", error);
    res.status(500).json({ error: "Error al configurar modo de detección continua" });
  }
});

module.exports = router;