import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import * as tf from '@tensorflow/tfjs';
import Camera from './Camera';
import PredictionDisplay from './PredictionDisplay';
import ModelDiagnostic from './ModelDiagnostic';
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
        // Intenta ambas rutas - para desarrollo y producción
        let loadedModel;
        try {
          loadedModel = await tf.loadLayersModel('/models/model.json');
        } catch (e) {
          console.log("Intentando ruta alternativa...");
          loadedModel = await tf.loadLayersModel('./models/model.json');
        }
        
        console.log("Modelo cargado exitosamente");
        setModel(loadedModel);
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

  // Detectar objetos en cada frame utilizando useCallback para memoización
  const detectFrame = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState >= 2 && model) {
      // Procesamos cada frame dentro de tf.tidy para limpiar tensores innecesarios
      tf.tidy(() => {
        const tensor = tf.browser.fromPixels(videoRef.current)
          .resizeNearestNeighbor([224, 224]) // Ajusta el tamaño según tu modelo
          .expandDims()
          .toFloat();

        // Normalizar si es necesario (depende de cómo entrenaste tu modelo)
        // Por ejemplo, si tu modelo espera valores entre -1 y 1:
        // .div(127.5).sub(1);
        
        // Depurar dimensiones del tensor
        console.log("Dimensiones del tensor:", tensor.shape);

        // Realizar la predicción
        const predictions = model.predict(tensor).dataSync();
        console.log("Predicciones brutas:", predictions);
        
        const maxProb = Math.max(...predictions);
        const idx = predictions.indexOf(maxProb);

        // Mapea el índice a la etiqueta correspondiente
        const etiquetas = ["barrita", "botella", "chicle"];
        const label = etiquetas[idx] || "Desconocido";
        const similarity = (maxProb * 100).toFixed(2);
        
        console.log(`Detectado: ${label} con precisión ${similarity}%`);
        setPrediction({ label, similarity: parseFloat(similarity) });
        
        // Registrar en Firebase
        logPrediction(label, similarity);
      });
    } else {
      console.log("Video no está listo o modelo no cargado");
      if (!videoRef.current) console.log("videoRef.current es null");
      else if (videoRef.current.readyState < 2) console.log("Video readyState:", videoRef.current.readyState);
      if (!model) console.log("Modelo no cargado");
    }
    
    // Continuar la detección en el siguiente frame
    rafRef.current = requestAnimationFrame(detectFrame);
  }, [model, videoRef]); // Incluye model y videoRef como dependencias

  // Iniciar detección cuando el modelo esté cargado
  useEffect(() => {
    if (model && videoRef.current) {
      console.log("Iniciando detección de frames");
      detectFrame();
    }
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [model, detectFrame]); // Ahora incluimos detectFrame como dependencia

  return (
    <>
      <Row className="mb-4">
        <Col md={12}>
          <ModelDiagnostic />
        </Col>
      </Row>
      
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
    </>
  );};

export default ObjectDetection;