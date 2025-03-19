import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import * as tf from '@tensorflow/tfjs';
import Camera from './Camera';
import PredictionDisplay from './PredictionDisplay';
import ProductForm from './ProductForm';
import { logPrediction } from '../services/predictionService';

const ObjectDetection = () => {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState({ label: '', similarity: 0 });
  const videoRef = useRef(null);
  const rafRef = useRef(null);

  // Cargar el modelo TensorFlow
  useEffect(() => {
    async function loadModel() {
      try {
        // Forzar uso del backend CPU
        await tf.setBackend('cpu');
        await tf.ready();
        
        // Cargar el modelo (ajusta la ruta según donde guardes tu modelo)
        const loadedModel = await tf.loadLayersModel('/models/model.json');
        setModel(loadedModel);
        console.log("Modelo cargado exitosamente");
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar el modelo:", error);
        setLoading(false);
      }
    }
    
    loadModel();
    
    // Cleanup
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Detectar objetos en cada frame
  const detectFrame = () => {
    if (videoRef.current && videoRef.current.readyState >= 2 && model) {
      // Procesamos cada frame dentro de tf.tidy para limpiar tensores innecesarios
      tf.tidy(() => {
        const tensor = tf.browser.fromPixels(videoRef.current)
          .resizeNearestNeighbor([224, 224]) // Ajusta el tamaño según tu modelo
          .expandDims()
          .toFloat();

        // Realizar la predicción
        const predictions = model.predict(tensor).dataSync();
        const maxProb = Math.max(...predictions);
        const idx = predictions.indexOf(maxProb);

        // Mapea el índice a la etiqueta correspondiente
        const etiquetas = ["barrita", "botella", "chicle"];
        const label = etiquetas[idx] || "Desconocido";
        const similarity = (maxProb * 100).toFixed(2);
        
        setPrediction({ label, similarity: parseFloat(similarity) });
        
        // Registrar en Firebase
        logPrediction(label, similarity);
      });
    }
    
    // Continuar la detección en el siguiente frame
    rafRef.current = requestAnimationFrame(detectFrame);
  };

  // Iniciar detección cuando el modelo esté cargado
  useEffect(() => {
    if (model && videoRef.current) {
      detectFrame();
    }
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [model]);

  return (
    <Row>
      <Col md={6}>
        <Card className="mb-4">
          <Card.Body>
            <Camera videoRef={videoRef} />
            <PredictionDisplay 
              loading={loading} 
              label={prediction.label} 
              similarity={prediction.similarity} 
            />
          </Card.Body>
        </Card>
      </Col>
      <Col md={6}>
        <Card>
          <Card.Header>
            <h4>Información del Producto</h4>
          </Card.Header>
          <Card.Body>
            <ProductForm detectedObject={prediction.label} />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default ObjectDetection;