const express = require('express');
const router = express.Router();
const detectionService = require('../services/detectionService');

// Realizar una detección
router.post('/detect', async (req, res) => {
  try {
    const detection = await detectionService.performDetection();
    res.json({
      success: true,
      detection
    });
  } catch (error) {
    console.error("Error en detección:", error);
    res.status(500).json({ error: "Error en detección" });
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

module.exports = router;