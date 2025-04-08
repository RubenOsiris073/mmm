import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, Row, Col, Button, Form, Spinner, Alert } from 'react-bootstrap';
import Webcam from 'react-webcam';
import { toast } from 'react-toastify';
import * as tf from '@tensorflow/tfjs';
import apiService from '../../services/apiService';
import './inventory.css'; 

const AIDetectionRegistration = ({ onProductRegistered }) => {
  const [loading, setLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [detectedObject, setDetectedObject] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState('almacen-principal');
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const webcamRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const modelRef = useRef(null);
  
  // Cargar el modelo de detección al montar el componente
  useEffect(() => {
    const loadModel = async () => {
      try {
        setModelLoading(true);
        
        // Cargar modelo desde el servidor o desde TensorFlow Hub
        // Aquí debes ajustar la URL según dónde esté alojado tu modelo
        const model = await tf.loadGraphModel('/models/model.json');
        modelRef.current = model;
        
        setModelLoading(false);
      } catch (error) {
        console.error('Error al cargar el modelo:', error);
        setErrorMsg('No se pudo cargar el modelo de detección. Por favor, recarga la página.');
        setModelLoading(false);
      }
    };
    
    loadModel();
    
    // Limpiar al desmontar
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      setIsCameraActive(false);
    };
  }, []);
  
  // Función para detectar objetos en la imagen
  const detectObjects = useCallback(async () => {
    if (
      !webcamRef.current || 
      !webcamRef.current.video || 
      !webcamRef.current.video.readyState === 4 ||
      !modelRef.current
    ) {
      return;
    }
    
    try {
      const video = webcamRef.current.video;
      
      // Capturar imagen de la cámara
      const imageTensor = tf.browser.fromPixels(video);
      
      // Preprocesar la imagen según requiera el modelo
      const expandedTensor = imageTensor.expandDims();
      
      // Realizar la detección
      const predictions = await modelRef.current.executeAsync(expandedTensor);
      
      // Procesar las predicciones según la estructura del modelo
      // (este código debe adaptarse según el tipo de modelo que estés usando)
      const scores = predictions[0].arraySync()[0];
      const boxes = predictions[1].arraySync()[0];
      const classes = predictions[2].arraySync()[0];
      
      // Encontrar el objeto con mayor confianza (por encima de un umbral)
      const threshold = 0.5;
      let highestScore = 0;
      let detectedClass = null;
      
      for (let i = 0; i < scores.length; i++) {
        if (scores[i] > threshold && scores[i] > highestScore) {
          highestScore = scores[i];
          detectedClass = classes[i];
        }
      }
      
      // Si se detectó un objeto con suficiente confianza
      if (detectedClass !== null) {
        // Enviar al servidor para buscar el producto correspondiente
        const response = await apiService.findProductByDetection(detectedClass);
        
        if (response && response.product) {
          setDetectedObject(response.product);
          
          // Solo notificar si es un objeto diferente al último detectado
          const lastDetection = detectionHistory[0];
          if (!lastDetection || lastDetection.id !== response.product.id) {
            toast.info(`Producto detectado: ${response.product.nombre}`);
            // Añadir a historial de detecciones
            setDetectionHistory(prev => [response.product, ...prev.slice(0, 4)]);
          }
        }
      }
      
      // Liberar tensores
      tf.dispose([imageTensor, expandedTensor, ...predictions]);
      
    } catch (error) {
      console.error('Error en detección:', error);
    }
  }, [detectionHistory]);
  
  // Iniciar/detener la cámara y detección
  const toggleCamera = () => {
    if (isCameraActive) {
      // Detener detección
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      setIsCameraActive(false);
      setDetecting(false);
    } else {
      // Iniciar cámara y detección
      setIsCameraActive(true);
      
      // Comenzar la detección después de un breve retraso para que la cámara se inicie
      setTimeout(() => {
        setDetecting(true);
        detectionIntervalRef.current = setInterval(() => {
          detectObjects();
        }, 1500); // Detectar cada 1.5 segundos
      }, 1000);
    }
  };
  
  // Registrar el producto detectado en el inventario
  const handleRegisterProduct = async () => {
    if (!detectedObject) {
      toast.error('No hay producto detectado para registrar');
      return;
    }
    
    try {
      setLoading(true);
      
      // Usar directamente apiService para actualizar inventario
      await apiService.updateInventory(
        detectedObject.id,
        parseInt(quantity),
        location,
        'Registro automático por IA'
      );
      
      // Notificar al componente padre para actualizar la lista de productos
      if (typeof onProductRegistered === 'function') {
        onProductRegistered();
      }
      
      // Mostrar mensaje de éxito
      setSuccessMsg(`Se ha añadido ${quantity} unidad(es) de ${detectedObject.nombre} al inventario`);
      toast.success(`Producto registrado: ${detectedObject.nombre}`);
      
      // Resetear valores
      setQuantity(1);
      
      // Ocultar mensaje después de unos segundos
      setTimeout(() => {
        setSuccessMsg('');
      }, 5000);
    } catch (error) {
      console.error('Error al registrar producto:', error);
      setErrorMsg('Error al registrar el producto en el inventario');
      toast.error('Error al registrar el producto');
      
      // Ocultar mensaje después de unos segundos
      setTimeout(() => {
        setErrorMsg('');
      }, 5000);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="ai-detection-container mb-4">
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="bg-dark text-white">
              <h5 className="mb-0">
                <i className="bi bi-camera-fill me-2"></i>
                Detección con Cámara
              </h5>
            </Card.Header>
            <Card.Body className="text-center">
              {modelLoading ? (
                <div className="p-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Cargando modelo de IA...</p>
                </div>
              ) : (
                <>
                  <div className="webcam-container">
                    {isCameraActive ? (
                      <>
                        <Webcam
                          ref={webcamRef}
                          audio={false}
                          screenshotFormat="image/jpeg"
                          videoConstraints={{
                            width: 480,
                            height: 360,
                            facingMode: "environment"
                          }}
                          className="rounded"
                          style={{ width: '100%', maxWidth: '480px' }}
                        />
                        {detecting && (
                          <div className="detection-overlay">
                            <div className="scanning-line"></div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="webcam-placeholder rounded d-flex align-items-center justify-content-center bg-light" style={{ width: '100%', height: '360px' }}>
                        <div>
                          <i className="bi bi-camera-video-off fs-1 text-muted"></i>
                          <p className="mt-2 text-muted">Cámara desactivada</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant={isCameraActive ? "danger" : "success"}
                    onClick={toggleCamera}
                    className="mt-3"
                  >
                    <i className={`bi bi-${isCameraActive ? 'camera-video-off' : 'camera-video'} me-2`}></i>
                    {isCameraActive ? 'Detener Cámara' : 'Activar Cámara'}
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>
          
          {/* Historial de detección */}
          {detectionHistory.length > 0 && (
            <Card>
              <Card.Header className="bg-light">
                <h6 className="mb-0">Últimas Detecciones</h6>
              </Card.Header>
              <Card.Body>
                <div className="detection-history">
                  {detectionHistory.map((product, index) => (
                    <div 
                      key={`${product.id}-${index}`} 
                      className="detection-item d-flex align-items-center p-2 border-bottom"
                    >
                      <div className="detection-icon me-3">
                        <i className="bi bi-box fs-4 text-primary"></i>
                      </div>
                      <div>
                        <h6 className="mb-0">{product.nombre}</h6>
                        <small className="text-muted">${product.precio?.toFixed(2)}</small>
                      </div>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        className="ms-auto"
                        onClick={() => setDetectedObject(product)}
                      >
                        Seleccionar
                      </Button>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
        
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Registro de Inventario</h5>
            </Card.Header>
            <Card.Body>
              {errorMsg && (
                <Alert variant="danger" onClose={() => setErrorMsg('')} dismissible>
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {errorMsg}
                </Alert>
              )}
              
              {successMsg && (
                <Alert variant="success" onClose={() => setSuccessMsg('')} dismissible>
                  <i className="bi bi-check-circle me-2"></i>
                  {successMsg}
                </Alert>
              )}
              
              {detectedObject ? (
                <div>
                  <div className="mb-4 p-3 border rounded bg-light">
                    <h5>Producto Detectado</h5>
                    <div className="d-flex align-items-center">
                      <div className="product-icon me-3 p-3 rounded-circle bg-primary text-white">
                        <i className="bi bi-box fs-4"></i>
                      </div>
                      <div>
                        <h4>{detectedObject.nombre}</h4>
                        <p className="mb-1">SKU: {detectedObject.sku || 'N/A'}</p>
                        <p className="mb-1">Precio: ${detectedObject.precio?.toFixed(2)}</p>
                        <p className="mb-0">Categoría: {detectedObject.categoria || 'Sin categoría'}</p>
                      </div>
                    </div>
                  </div>
                
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Cantidad a registrar:</Form.Label>
                      <Form.Control 
                        type="number" 
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min="1"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Ubicación:</Form.Label>
                      <Form.Select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      >
                        <option value="almacen-principal">Almacén Principal</option>
                        <option value="tienda-principal">Tienda Principal</option>
                        <option value="bodega">Bodega</option>
                      </Form.Select>
                    </Form.Group>
                    
                    <Button 
                      variant="primary" 
                      onClick={handleRegisterProduct}
                      disabled={loading}
                      className="w-100"
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Registrando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-plus-circle me-2"></i>
                          Registrar en Inventario
                        </>
                      )}
                    </Button>
                  </Form>
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <i className="bi bi-camera text-muted" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h5 className="text-muted">Ningún producto detectado</h5>
                  <p className="text-muted">
                    Active la cámara y muestre un producto para detectarlo automáticamente.
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header className="bg-light">
              <h5 className="mb-0">Instrucciones</h5>
            </Card.Header>
            <Card.Body>
              <ol>
                <li className="mb-2">Haga clic en "Activar Cámara" para iniciar la detección.</li>
                <li className="mb-2">Coloque el producto frente a la cámara para que sea detectado.</li>
                <li className="mb-2">Una vez detectado, verifique los datos del producto.</li>
                <li className="mb-2">Ajuste la cantidad si es necesario.</li>
                <li className="mb-2">Seleccione la ubicación donde se registrará el inventario.</li>
                <li>Haga clic en "Registrar en Inventario" para finalizar.</li>
              </ol>
              <Alert variant="info" className="mt-3">
                <i className="bi bi-info-circle me-2"></i>
                Para mejores resultados, asegúrese de que el producto esté bien iluminado y centrado en la imagen.
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AIDetectionRegistration;