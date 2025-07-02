const tf = require('@tensorflow/tfjs-node');
const path = require('path');
const { addDetection, getDetections } = require('./storageService');
const Logger = require('../utils/logger.js');

class DetectionService {
  constructor() {
    this.model = null;
    this.isActive = false;
    this.detectionInterval = null;
    this.intervalMs = 1000; // Intervalo por defecto: 1 segundo
    this.modelPath = path.join(__dirname, '../models/model.json');
    this.initialize();
  }

  async initialize() {
    try {
      Logger.info("Iniciando servicio de detección...");
      await this.loadModel();
      Logger.info("Servicio de detección inicializado");
    } catch (error) {
      Logger.error("Error al inicializar servicio de detección:", error);
    }
  }

  async loadModel() {
    try {
      Logger.info("Cargando modelo desde:", this.modelPath);
      this.model = await tf.loadLayersModel(`file://${this.modelPath}`);
      Logger.info("Modelo cargado exitosamente");
    } catch (error) {
      Logger.error("Error al cargar el modelo:", error);
      throw error;
    }
  }

  async performDetection(imageData) {
    try {
      if (!this.model) {
        throw new Error("Modelo no inicializado");
      }

      // Decodificar la imagen base64
      const imageBuffer = Buffer.from(imageData.split(',')[1], 'base64');
      
      // Convertir a tensor
      const tensor = tf.tidy(() => {
        const decoded = tf.node.decodeImage(imageBuffer);
        return decoded
          .resizeNearestNeighbor([224, 224])
          .expandDims()
          .toFloat();
      });

      // Realizar predicción
      const predictions = await this.model.predict(tensor).data();
      tensor.dispose();

      // Procesar resultados
      const maxProb = Math.max(...predictions);
      const idx = predictions.indexOf(maxProb);
      const etiquetas = ["Barrita", "Botella", "Chicle"];
      const label = etiquetas[idx] || "Desconocido";
      const similarity = parseFloat((maxProb * 100).toFixed(2));

      // Crear objeto de detección
      const detection = {
        label,
        similarity,
        timestamp: new Date().toISOString()
      };

      // Guardar en base de datos si la confianza es alta
      if (similarity > 60) {
        await addDetection(detection);
      }

      return detection;
    } catch (error) {
      Logger.error("Error en detección:", error);
      throw error;
    }
  }

  async getRecentDetections(limit = 10) {
    try {
      const detections = await getDetections(limit);
      return detections;
    } catch (error) {
      Logger.error("Error al obtener detecciones:", error);
      throw error;
    }
  }

  getDetectionMode() {
    return {
      active: this.isActive,
      intervalMs: this.intervalMs
    };
  }

  setDetectionMode(active, intervalMs = 1000) {
    this.isActive = active;
    this.intervalMs = intervalMs;

    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }

    return {
      active: this.isActive,
      intervalMs: this.intervalMs,
      success: true
    };
  }

  async getDetectionStatus() {
    return {
      active: this.isActive,
      modelLoaded: !!this.model,
      intervalMs: this.intervalMs
    };
  }
}

// Crear una instancia única del servicio
const detectionService = new DetectionService();

module.exports = detectionService;