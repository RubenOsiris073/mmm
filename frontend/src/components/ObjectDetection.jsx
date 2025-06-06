import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import * as tf from '@tensorflow/tfjs';
import Camera from './shared/Camera';
import PredictionDisplay from './PredictionDisplay';
import ProductForm from './ProductForm';
import ModelDiagnostic from './ModelDiagnostic';
import { logPrediction } from '../../backend/services/predictionService';

const ObjectDetection = () => {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState({ label: '', similarity: 0 });
  const [isDetecting, setIsDetecting] = useState(true);
  const videoRef = useRef(null);
  const rafRef = useRef(null);
  const isRunning = useRef(true);
  const detectionCount = useRef(0);

  // Cargar el modelo TensorFlow
  useEffect(() => {
    async function loadModel() {
      try {
        // Forzar uso del backend CPU
        await tf.setBackend('cpu');
        await tf.ready();
        
        console.log("Cargando modelo...");
        
        // Intenta cargar el modelo desde la carpeta public
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
        console.error("❌ Error al cargar el modelo:", error);
        setLoading(false);
      }
    }
    
    loadModel();
    
    // Asegurarse de que el detector se detenga cuando el componente se desmonte
    return () => {
      console.log("Desmontando componente - limpiando recursos");
      isRunning.current = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  // Función para detectar objetos en un frame de video
  const detectFrame = useCallback(() => {
    // Salir si el componente se desmontó o se pausó la detección
    if (!isRunning.current || !isDetecting) {
      console.log("Detección pausada o componente desmontado");
      return;
    }

    detectionCount.current++;
    
    // Solo para depuración - mostrar heartbeat de detección cada 30 frames
    if (detectionCount.current % 30 === 0) {
      console.log(`🔍 Detección en curso... (${detectionCount.current} frames procesados)`);
    }
    
    if (videoRef.current && videoRef.current.readyState >= 2 && model) {
      // Procesamos cada frame dentro de tf.tidy para limpiar tensores innecesarios
      tf.tidy(() => {
        try {
          const tensor = tf.browser.fromPixels(videoRef.current)
            .resizeNearestNeighbor([224, 224]) // Ajusta el tamaño según tu modelo
            .expandDims()
            .toFloat();
          
          // Normalizar si es necesario (ajustar según el modelo)
          // const normalizedTensor = tensor.div(255.0);  // Normalizar a [0,1]
          
          // Realizar la predicción
          const predictions = model.predict(tensor).dataSync();
          
          const maxProb = Math.max(...predictions);
          const idx = predictions.indexOf(maxProb);

          // Mapea el índice a la etiqueta correspondiente
          const etiquetas = ["Barrita", "Botella", "Chicle"];
          const label = etiquetas[idx] || "Desconocido";
          const similarity = (maxProb * 100).toFixed(2);
          
          // Sólo actualizar el estado si hay un cambio significativo para evitar re-renders innecesarios
          if (prediction.label !== label || Math.abs(prediction.similarity - parseFloat(similarity)) > 5) {
            console.log(`📊 Detectado: ${label} con precisión ${similarity}%`);
            setPrediction({ label, similarity: parseFloat(similarity) });
            
            // Registrar en Firebase (solo para cambios significativos)
            if (parseFloat(similarity) > 60) {
              logPrediction(label, similarity);
            }
          }
        } catch (err) {
          console.error("Error en procesamiento de frame:", err);
        }
      });
    }
    
    // Programar el siguiente frame usando requestAnimationFrame
    rafRef.current = requestAnimationFrame(detectFrame);
  }, [isDetecting, model, prediction.label, prediction.similarity]);

  // Iniciar/Detener detección basado en isDetecting
  useEffect(() => {
    if (isDetecting && model && !rafRef.current) {
      console.log("▶️ Iniciando bucle de detección");
      isRunning.current = true;
      detectionCount.current = 0;
      detectFrame();
    } else if (!isDetecting && rafRef.current) {
      console.log("⏸️ Pausando bucle de detección");
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, [isDetecting, model, detectFrame]);

  // Efecto para iniciar la detección cuando el modelo se carga
  useEffect(() => {
    if (model && isDetecting && !rafRef.current) {
      console.log("🔄 Modelo cargado, iniciando detección");
      detectFrame();
    }
  }, [model, isDetecting, detectFrame]);

  // Función para alternar entre detección activa/pausada
  const toggleDetection = () => {
    setIsDetecting(prev => !prev);
  };

  return (
    <>
      <Row className="mb-4">
        <Col md={12}>
          <ModelDiagnostic />
        </Col>
      </Row>
      
      <Row className="mb-3">
        <Col>
          <Button 
            variant={isDetecting ? "danger" : "success"} 
            onClick={toggleDetection}
            className="w-100 mb-3"
          >
            {isDetecting ? "⏸️ Pausar Detección" : "▶️ Reanudar Detección"}
          </Button>
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
  );
};

export default ObjectDetection;