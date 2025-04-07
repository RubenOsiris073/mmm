const tf = require('@tensorflow/tfjs-node');
const path = require('path');
const { addDetection } = require('./storageService');

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
      console.log("Iniciando servicio de detección...");
      await this.loadModel();
      console.log("Servicio de detección inicializado");
    } catch (error) {
      console.error("Error al inicializar servicio de detección:", error);
    }
  }

  async loadModel() {
    try {
      console.log("Cargando modelo desde:", this.modelPath);
      this.model = await tf.loadLayersModel(`file://${this.modelPath}`);
      console.log("Modelo cargado exitosamente");
    } catch (error) {
      console.error("Error al cargar el modelo:", error);
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
      console.error("Error en detección:", error);
      throw error;
    }
  }

  async getRecentDetections(limit = 10) {
    try {
      // Implementa la lógica para obtener las detecciones recientes de la base de datos
      const detections = await getDetections(limit);
      return detections;
    } catch (error) {
      console.error("Error al obtener detecciones:", error);
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