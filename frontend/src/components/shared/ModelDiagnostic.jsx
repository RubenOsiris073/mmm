import React, { useEffect, useState } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import * as tf from '@tensorflow/tfjs';

const ModelDiagnostic = () => {
  const [diagnosticInfo, setDiagnosticInfo] = useState({
    tfVersion: '',
    backend: '',
    modelExists: false,
    modelLoaded: false,
    error: null
  });

  const runDiagnostic = async () => {
    try {
      // Verificar versión de TF.js y backend
      const tfVersion = tf.version.tfjs;
      await tf.ready();
      const backend = tf.getBackend();
      
      // Comprobar si el modelo existe en la ruta especificada
      let modelExists = false;
      let modelLoaded = false;
      
      try {
        // Fetch para verificar si el archivo model.json existe
        const response = await fetch('/models/model.json');
        modelExists = response.ok;
        
        if (modelExists) {
          // Intentar cargar el modelo
          const model = await tf.loadLayersModel('/models/model.json');
          modelLoaded = true;
          
          // Inspeccionar el modelo
          console.log("Arquitectura del modelo:", model.summary());
          
          // Crear tensor de prueba (224x224 imágenes RGB)
          const testTensor = tf.zeros([1, 224, 224, 3]);
          
          // Probar inferencia
          const result = model.predict(testTensor);
          console.log("Forma de la salida:", result.shape);
          console.log("Resultados de prueba:", await result.data());
          
          // Limpiar tensores
          testTensor.dispose();
          result.dispose();
        }
      } catch (modelError) {
        console.error("Error probando el modelo:", modelError);
        
        setDiagnosticInfo({
          tfVersion,
          backend,
          modelExists,
          modelLoaded,
          error: modelError.toString()
        });
        return;
      }
      
      setDiagnosticInfo({
        tfVersion,
        backend,
        modelExists,
        modelLoaded,
        error: null
      });
    } catch (error) {
      console.error("Error en diagnóstico:", error);
      setDiagnosticInfo(prev => ({
        ...prev,
        error: error.toString()
      }));
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  return (
    <Card className="mb-4">
      <Card.Header>Diagnóstico del Modelo</Card.Header>
      <Card.Body>
        <dl className="row">
          <dt className="col-sm-4">Versión TensorFlow.js:</dt>
          <dd className="col-sm-8">{diagnosticInfo.tfVersion}</dd>
          
          <dt className="col-sm-4">Backend:</dt>
          <dd className="col-sm-8">{diagnosticInfo.backend}</dd>
          
          <dt className="col-sm-4">Archivo del modelo:</dt>
          <dd className="col-sm-8">
            {diagnosticInfo.modelExists ? 
              <span className="text-success">✓ Encontrado</span> : 
              <span className="text-danger">✗ No encontrado</span>}
          </dd>
          
          <dt className="col-sm-4">Carga del modelo:</dt>
          <dd className="col-sm-8">
            {diagnosticInfo.modelLoaded ? 
              <span className="text-success">✓ Exitosa</span> : 
              <span className="text-danger">✗ Fallida</span>}
          </dd>
        </dl>
        
        {diagnosticInfo.error && (
          <Alert variant="danger">
            <h5>Error:</h5>
            <pre style={{whiteSpace: 'pre-wrap'}}>{diagnosticInfo.error}</pre>
          </Alert>
        )}
        
        <Button variant="primary" onClick={runDiagnostic}>
          Ejecutar diagnóstico
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ModelDiagnostic;