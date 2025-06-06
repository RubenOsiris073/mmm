import React, { useState, useEffect, useRef } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Añadir esta importación
import * as tf from '@tensorflow/tfjs';
import Camera from './Camera';
import PredictionDisplay from './PredictionDisplay';
import { addDetection } from '../../services/storageService';

const CameraView = () => {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState({ label: '', similarity: 0 });
  const [isDetecting, setIsDetecting] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedDetection, setSavedDetection] = useState(null);
  const videoRef = useRef(null);
  const rafRef = useRef(null);
  const isRunning = useRef(true);
  const detectionCount = useRef(0);

  // Cargar el modelo TensorFlow
  useEffect(() => {
    async function loadModel() {
      try {
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
    
    return () => {
      isRunning.current = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  // Función de detección continua
  const detectFrame = React.useCallback(() => {
    if (!isRunning.current || !isDetecting) {
      return;
    }

    detectionCount.current++;
    
    if (videoRef.current && videoRef.current.readyState >= 2 && model) {
      tf.tidy(() => {
        try {
          const tensor = tf.browser.fromPixels(videoRef.current)
            .resizeNearestNeighbor([224, 224])
            .expandDims()
            .toFloat();
          
          const predictions = model.predict(tensor).dataSync();
          const maxProb = Math.max(...predictions);
          const idx = predictions.indexOf(maxProb);

          const etiquetas = ["Barrita", "Botella", "Chicle"];
          const label = etiquetas[idx] || "Desconocido";
          const similarity = (maxProb * 100).toFixed(2);
          
          // Actualizar estado solo si hay cambio significativo
          if (prediction.label !== label || 
              Math.abs(prediction.similarity - parseFloat(similarity)) > 5) {
            console.log(`📊 Detectado: ${label} con precisión ${similarity}%`);
            setPrediction({ label, similarity: parseFloat(similarity) });
          }
        } catch (err) {
          console.error("Error en procesamiento de frame:", err);
        }
      });
    }
    
    rafRef.current = requestAnimationFrame(detectFrame);
  }, [model, isDetecting, prediction.label, prediction.similarity]);

  // Iniciar/parar detección
  useEffect(() => {
    if (isDetecting && model) {
      isRunning.current = true;
      detectFrame();
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isDetecting, model, detectFrame]);

  // Guardar el objeto detectado en la base de datos
  const handleSaveDetection = async () => {
    if (prediction && prediction.label && prediction.similarity > 50) {
      try {
        const detectionId = await addDetection({
          label: prediction.label,
          similarity: prediction.similarity,
          timestamp: new Date().toISOString()
        });
        
        // Incluir el ID en el state para el enlace
        const detectionWithId = {
          ...prediction,
          id: detectionId
        };
        
        // Mostrar mensaje de éxito
        setSaveSuccess(true);
        setSavedDetection(detectionWithId);
        
        setTimeout(() => {
          setSaveSuccess(false);
          setSavedDetection(null);
        }, 5000);
      } catch (error) {
        console.error("Error al guardar la detección:", error);
      }
    }
  };

  return (
    <>
      <Camera videoRef={videoRef} />
      
      <PredictionDisplay 
        loading={loading} 
        label={prediction.label} 
        similarity={prediction.similarity} 
      />
      
      <div className="d-flex justify-content-between mt-4">
        <Button 
          variant={isDetecting ? "danger" : "success"} 
          onClick={() => setIsDetecting(prev => !prev)}
        >
          {isDetecting ? "⏸️ Pausar Detección" : "▶️ Reanudar Detección"}
        </Button>
        
        <Button 
          variant="primary" 
          onClick={handleSaveDetection}
          disabled={!prediction.label || prediction.similarity < 50}
        >
          💾 Guardar Producto Detectado
        </Button>
      </div>
      
      {saveSuccess && (
        <Alert variant="success" className="mt-3">
          ✅ Producto guardado exitosamente en la lista
        </Alert>
      )}

      {saveSuccess && savedDetection && (
        <div className="d-flex justify-content-center mt-3">
          <Link 
            to="/product-form" 
            state={{ product: savedDetection }}
          >
            <Button variant="outline-success">
              Registrar Detalles Completos →
            </Button>
          </Link>
        </div>
      )}
    </>
  );
};

export default CameraView;