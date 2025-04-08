import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, Row, Col, Button, Form, Spinner, Alert } from 'react-bootstrap';
import Webcam from 'react-webcam';
import { toast } from 'react-toastify';
import apiService from '../../services/apiService';
import './inventory.css';

const AIDetectionRegistration = ({ onProductRegistered }) => {
  const [loading, setLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectedObject, setDetectedObject] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState('almacen-principal');
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);
  const [detectionCount, setDetectionCount] = useState(0);
  const [detectionSuccess, setDetectionSuccess] = useState(false);

  const webcamRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  // Función auxiliar para normalizar datos del producto
  const normalizeProduct = (product) => {
    if (!product) return null;

    // Crear una copia para no modificar el original
    const normalized = { ...product };

    // Asegurar que tenga los campos necesarios con los nombres correctos
    if (!normalized.nombre && normalized.name) {
      normalized.nombre = normalized.name;
    }

    if (!normalized.precio && normalized.price) {
      normalized.precio = normalized.price;
    }

    if (!normalized.categoria && normalized.category) {
      normalized.categoria = normalized.category;
    }

    if (!normalized.codigo && normalized.code) {
      normalized.codigo = normalized.code;
    }

    return normalized;
  };

  // Verificar si la API de detección está funcionando
  useEffect(() => {
    const checkDetectionApi = async () => {
      try {
        setModelLoading(true);

        // Verificamos que la API está disponible usando un endpoint existente
        await apiService.getProducts();

        setModelLoading(false);
      } catch (error) {
        console.error('Error al conectar con la API:', error);
        setErrorMsg('No se pudo conectar con la API de detección. Por favor, intente más tarde.');
        setModelLoading(false);
      }
    };

    checkDetectionApi();

    // Limpiar al desmontar
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      setIsCameraActive(false);
    };
  }, []);

  // Función mejorada para detectar objetos
  const detectObjects = useCallback(async () => {
    if (!webcamRef.current || !webcamRef.current.video || webcamRef.current.video.readyState !== 4) {
      return;
    }

    try {
      setDetectionCount(prev => prev + 1);

      // Capturar imagen de la webcam
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      console.log("⏳ Iniciando detección de objeto...");

      // Enviamos la imagen para detección
      const detectionResult = await apiService.triggerDetection(imageSrc);
      setLastResponse(detectionResult);

      console.log("📊 Resultado de detección:", detectionResult);

      // Verificar si la detección fue exitosa y contiene los datos esperados
      if (detectionResult && detectionResult.detection) {
        const { detection } = detectionResult;

        // Extraer la clase correctamente, podría estar en varios campos diferentes
        const detectedClass = detection.class || detection.className || detection.label;

        if (detectedClass) {
          console.log("🔍 Clase detectada:", detectedClass);

          try {
            // Buscar producto por la clase detectada
            const productResponse = await apiService.findProductByDetection(detectedClass);

            console.log("🏷️ Respuesta de producto:", productResponse);

            // Verificar si se encontró un producto válido
            if (productResponse && productResponse.product) {
              // Normalizar los datos del producto
              const normalizedProduct = normalizeProduct(productResponse.product);

              // Mostrar el producto detectado en la interfaz
              setDetectedObject(normalizedProduct);
              setDetectionSuccess(true);

              // Notificar solo si es diferente al último detectado
              const lastDetection = detectionHistory[0];
              if (!lastDetection || lastDetection.id !== normalizedProduct.id) {
                toast.info(`Producto detectado: ${normalizedProduct.nombre}`);
                // Añadir a historial de detecciones
                setDetectionHistory(prev => [normalizedProduct, ...prev.slice(0, 4)]);
              }

              console.log("✅ Producto establecido en la interfaz:", normalizedProduct);
            } else {
              console.warn("⚠️ No se encontró producto para la clase:", detectedClass);
              setDetectionSuccess(false);
              // No mostrar toast cada vez para no molestar al usuario
            }
          } catch (productError) {
            console.error("❌ Error buscando producto por clase:", productError);
            setDetectionSuccess(false);
          }
        } else {
          console.warn("⚠️ Detección sin clase definida:", detection);
          setDetectionSuccess(false);
        }
      } else {
        console.warn("⚠️ Formato de respuesta de detección inesperado:", detectionResult);
        setDetectionSuccess(false);
      }
    } catch (error) {
      console.error("❌ Error en detección:", error);
      setDetectionSuccess(false);
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

  // Función para generar productos simulados (para pruebas cuando falla la detección)
  const getMockProduct = () => {
    const mockProducts = [
      {
        id: "sim-1001",
        nombre: "Botella de Agua",
        precio: 15.99,
        categoria: "Bebidas",
        codigo: "BOT-001",
        sku: "AGUA-500ML"
      },
      {
        id: "sim-1002",
        nombre: "Teléfono Móvil",
        precio: 599.99,
        categoria: "Electrónicos",
        codigo: "TEL-002",
        sku: "MOV-SMART"
      },
      {
        id: "sim-1003",
        nombre: "Libro de Programación",
        precio: 45.50,
        categoria: "Libros",
        codigo: "LIB-003",
        sku: "PROG-JS"
      }
    ];

    return mockProducts[Math.floor(Math.random() * mockProducts.length)];
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
                  <p className="mt-3">Conectando con el servidor de IA...</p>
                </div>
              ) : errorMsg ? (
                <div className="text-center py-4">
                  <Alert variant="warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {errorMsg}
                    <div className="mt-3">
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => {
                          setErrorMsg('');
                          // Intentar reconectar
                          setModelLoading(true);
                          apiService.getProducts()
                            .then(() => setModelLoading(false))
                            .catch(err => {
                              console.error('Error al reconectar:', err);
                              setErrorMsg('No se pudo conectar con el servidor. Usando modo simulación.');
                              setModelLoading(false);
                            });
                        }}
                      >
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Intentar nuevamente
                      </Button>
                    </div>
                  </Alert>
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
                  <div className="mt-2">
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="text-muted"
                      onClick={() => setDebugMode(!debugMode)}
                    >
                      <i className="bi bi-bug me-1"></i>
                      {debugMode ? 'Ocultar debug' : 'Mostrar debug'}
                    </Button>
                  </div>
                  {isCameraActive && (
                    <div className="mt-2">
                      <span className={`badge ${detectionSuccess ? 'bg-success' : 'bg-secondary'}`}>
                        <i className={`bi bi-${detectionSuccess ? 'check-circle' : 'arrow-repeat'} me-1`}></i>
                        {detectionCount} {detectionCount === 1 ? 'detección' : 'detecciones'}
                      </span>
                      {detectionSuccess && (
                        <span className="text-success ms-2">
                          <small><i className="bi bi-check-circle-fill me-1"></i>Producto detectado</small>
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
              {debugMode && lastResponse && (
                <div className="mt-3 p-2 border rounded bg-light">
                  <div className="d-flex justify-content-between mb-2">
                    <small className="text-muted">Debug: Última respuesta</small>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0"
                      onClick={() => setDebugMode(false)}
                    >
                      <i className="bi bi-x"></i>
                    </Button>
                  </div>
                  <pre className="mb-0" style={{fontSize: '0.75rem', maxHeight: '150px', overflow: 'auto'}}>
                    {JSON.stringify(lastResponse, null, 2)}
                  </pre>
                </div>
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