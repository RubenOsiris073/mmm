const tf = require('@tensorflow/tfjs-node');
const { writeFile } = require('fs/promises');
const path = require('path');
const { Buffer } = require('buffer');
const Logger = require('../utils/logger.js');

let model = null;

// Función para cargar el modelo
async function loadModel() {
  try {
    Logger.info("Cargando modelo TensorFlow...");
    model = await tf.loadLayersModel('file://./models/model.json');
    Logger.info("Modelo cargado exitosamente");
    return true;
  } catch (error) {
    Logger.error("Error al cargar el modelo:", error);
    return false;
  }
}

// Función para procesar la imagen
async function processImage(imageBuffer) {
  try {
    // Decodificar la imagen
    const tensor = tf.node.decodeImage(imageBuffer);
    
    // Preprocesar la imagen
    const processed = tensor
      .resizeNearestNeighbor([224, 224])
      .expandDims()
      .toFloat();
    
    // Realizar la predicción
    const predictions = await model.predict(processed).data();
    
    // Limpiar tensores
    tensor.dispose();
    processed.dispose();
    
    // Obtener el resultado
    const maxProb = Math.max(...predictions);
    const idx = predictions.indexOf(maxProb);
    const etiquetas = ['Botella_Ciel_100ML', 'Cacahuates_Kiyakis_120G', 'Trident_13G', 'Del Valle_413ML', 'Pop_45G',
      'Dr.Peppe_335ML', 'Sabritas_150G', 'Takis_70G'];
    
    return {
      label: etiquetas[idx] || "Desconocido",
      similarity: (maxProb * 100).toFixed(2)
    };
  } catch (error) {
    Logger.error("Error en el procesamiento:", error);
    throw error;
  }
}

const detectObject = async (req, res) => {
  try {
    // Verificar si el modelo está cargado
    if (!model) {
      const loaded = await loadModel();
      if (!loaded) {
        return res.status(500).json({
          error: "No se pudo cargar el modelo de detección"
        });
      }
    }

    // Verificar que se recibió una imagen
    if (!req.body.image) {
      return res.status(400).json({
        error: "No se recibió ninguna imagen"
      });
    }

    // Convertir base64 a buffer
    const imageBuffer = Buffer.from(req.body.image.split(',')[1], 'base64');

    // Procesar la imagen
    const result = await processImage(imageBuffer);

    // Devolver resultado
    res.json({
      success: true,
      prediction: result
    });

  } catch (error) {
    Logger.error("Error en la detección:", error);
    res.status(500).json({
      error: "Error en el procesamiento de la imagen"
    });
  }
};

module.exports = {
  detectObject
};