import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Table, Form, 
  Spinner, Alert, Badge, ListGroup, Modal
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import apiService from '../../services/apiService';

const POSView = () => {
  // Estados principales
  const [products, setProducts] = useState([]);
  const [wallet, setWallet] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [lastDetection, setLastDetection] = useState(null);
  const [continuousDetection, setContinuousDetection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastAddedProduct, setLastAddedProduct] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [amountReceived, setAmountReceived] = useState('');
  const [clientName, setClientName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Datos de demostración (usar si la API falla)
  const demoProducts = [
    { id: "prod1", nombre: "Coca Cola", label: "botella", precio: 25, categoria: "bebida" },
    { id: "prod2", nombre: "Snickers", label: "barrita", precio: 15, categoria: "botella" },
    { id: "prod3", nombre: "Chicle Trident", label: "chicle", precio: 10, categoria: "golosina" },
    { id: "prod4", nombre: "Agua Mineral", label: "botella", precio: 20, categoria: "bebida" },
    { id: "prod5", nombre: "Jabón Dove", label: "jabon", precio: 35, categoria: "limpieza" }
  ];

  const demoWallet = [
    { id: "prod1", nombre: "Coca Cola", cantidad: 10 },
    { id: "prod2", nombre: "Snickers", cantidad: 15 },
    { id: "prod3", nombre: "Chicle Trident", cantidad: 20 },
    { id: "prod4", nombre: "Agua Mineral", cantidad: 8 },
    { id: "prod5", nombre: "Jabón Dove", cantidad: 5 }
  ];

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        let productsData = [];
        let walletData = [];
        
        try {
          const productsResponse = await apiService.getProducts();
          productsData = productsResponse.products || [];
          console.log(`Productos cargados: ${productsData.length}`, productsData);
          
          if (!productsData || productsData.length === 0) {
            console.log("Usando productos de demostración");
            productsData = demoProducts;
          }
        } catch (err) {
          console.log("Error cargando productos, usando demo:", err);
          productsData = demoProducts;
        }
        
        try {
          const walletResponse = await apiService.getWallet();
          walletData = walletResponse.wallet || [];
          console.log(`Wallet cargado: ${walletData.length}`, walletData);
          
          if (!walletData || walletData.length === 0) {
            console.log("Usando wallet de demostración");
            walletData = demoWallet;
          }
        } catch (err) {
          console.log("Error cargando wallet, usando demo:", err);
          walletData = demoWallet;
        }
        
        // Cargar estado de detección
        let detectionStatus = { active: false };
        try {
          detectionStatus = await apiService.getDetectionStatus();
        } catch (statusError) {
          console.log("Error al cargar estado de detección:", statusError);
        }
        
        setProducts(productsData);
        setWallet(walletData);
        setContinuousDetection(detectionStatus.active);
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("Error al cargar productos y/o inventario. Usando datos locales.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Verificar detecciones continuas
  useEffect(() => {
    if (!continuousDetection) return;
    
    console.log("Iniciando verificación de detecciones continuas");
    
    const interval = setInterval(async () => {
      try {
        console.log("Verificando nuevas detecciones...");
        const response = await apiService.getDetections();
        const detections = response?.detections || [];
        
        if (detections && detections.length > 0) {
          const latestDetection = detections[0]; // La más reciente
          
          // Solo procesar si es una detección nueva
          if (!lastDetection || lastDetection.id !== latestDetection.id) {
            console.log("Nueva detección encontrada:", latestDetection);
            setLastDetection(latestDetection);
            
            // Si la detección es confiable, añadir al carrito
            if (latestDetection.similarity > 70) {
              addDetectedProductToCart(
                latestDetection.label,
                latestDetection.productInfo
              );
            }
          }
        }
      } catch (err) {
        console.error("Error verificando detecciones:", err);
        // No mostrar error en UI para no interrumpir la experiencia
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [continuousDetection, lastDetection]);

  // Cambiar modo de detección continua
  const toggleContinuousDetection = async () => {
    try {
      setLoading(true);
      const newStatus = !continuousDetection;
      
      const result = await apiService.setDetectionMode(newStatus);
      console.log(`Modo detección continua ${newStatus ? 'activado' : 'desactivado'}:`, result);
      
      setContinuousDetection(newStatus);
      
      toast.info(
        newStatus 
          ? "Modo de detección continua activado" 
          : "Modo de detección continua desactivado"
      );
    } catch (err) {
      console.error("Error cambiando modo de detección:", err);
      setError("Error al cambiar modo de detección");
    } finally {
      setLoading(false);
    }
  };

  // Realizar detección manual
  const triggerManualDetection = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Iniciando detección manual...");
      const result = await apiService.triggerDetection();
      console.log("Resultado de detección:", result);
      
      if (result && result.detection) {
        setLastDetection(result.detection);
        
        if (result.detection.similarity > 70) {
          // Usar la información del producto si está disponible
          addDetectedProductToCart(
            result.detection.label, 
            result.detection.productInfo
          );
        } else {
          setError(`Detección poco confiable (${result.detection.similarity}%). Intente nuevamente.`);
          setTimeout(() => setError(null), 3000);
        }
      } else {
        throw new Error("La respuesta de detección no tiene el formato esperado");
      }
    } catch (err) {
      console.error("Error en detección manual:", err);
      setError("Error al realizar detección. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Añadir producto detectado al carrito
  const addDetectedProductToCart = (productLabel, productInfo = null) => {
    console.log("Intentando añadir al carrito:", productLabel, "Info adicional:", productInfo);
    
    if (!productLabel) {
      console.log("Etiqueta de producto vacía");
      return;
    }
    
    // Si tenemos información directa del producto, la usamos
    if (productInfo && productInfo.id) {
      console.log("Usando información directa del producto:", productInfo);
      
      // Verificar stock en wallet
      const walletItem = wallet.find(w => w.id === productInfo.id);
      const stockAvailable = walletItem ? walletItem.cantidad : (productInfo.stock || 0);
      
      console.log(`Stock disponible para ${productInfo.nombre || productInfo.label}: ${stockAvailable}`);
      
      if (stockAvailable <= 0) {
        console.log("Producto sin stock disponible");
        setError(`${productInfo.nombre || productInfo.label}: Sin stock disponible`);
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      // Añadir al carrito con la información completa
      addToCart({
        id: productInfo.id,
        nombre: productInfo.nombre || productInfo.label,
        precio: productInfo.precio || 0,
        label: productInfo.label,
        stock: stockAvailable
      });
      return;
    }
    
    // Normalizar la etiqueta para comparación
    const normalizedLabel = productLabel.toString().toLowerCase().trim();
    
    // Buscar el producto (primero por label exacto)
    let product = products.find(p => 
      p.label && p.label.toLowerCase() === normalizedLabel
    );
    
    // Si no encontramos por label exacto, buscar por nombre
    if (!product) {
      product = products.find(p => 
        p.nombre && p.nombre.toLowerCase() === normalizedLabel
      );
    }
    
    // Si aún no encontramos, buscar coincidencia parcial
    if (!product) {
      product = products.find(p => 
        (p.label && p.label.toLowerCase().includes(normalizedLabel)) ||
        (p.nombre && p.nombre.toLowerCase().includes(normalizedLabel))
      );
    }
    
    if (!product) {
      console.log(`Producto no encontrado para etiqueta: ${productLabel}`);
      setError(`Producto "${productLabel}" no encontrado en inventario`);
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    console.log("Producto encontrado:", product);
    
    // Verificar stock en wallet
    const walletItem = wallet.find(w => w.id === product.id);
    if (!walletItem || walletItem.cantidad <= 0) {
      console.log(`Producto sin stock disponible. Wallet item:`, walletItem);
      setError(`${product.nombre || product.label}: Sin stock disponible`);
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    console.log(`Stock disponible para ${product.nombre}: ${walletItem.cantidad}`);
    
    // Añadir al carrito con stock incluido
    addToCart({
      ...product,
      stock: walletItem.cantidad
    });
  };
  
  // Añadir al carrito
  const addToCart = (product) => {
    // Verificar si ya está en el carrito
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      // Incrementar cantidad
      setCartItems(cartItems.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.precio || 0) * (item.quantity + 1) } 
          : item
      ));
    } else {
      // Añadir nuevo item
      setCartItems([...cartItems, {
        id: product.id,
        nombre: product.nombre || product.label,
        precio: product.precio || 0,
        quantity: 1,
        total: (product.precio || 0)
      }]);
    }
    
    // Mostrar retroalimentación visual
    setLastAddedProduct(product);
    setTimeout(() => setLastAddedProduct(null), 2000);
    
    // Reproducir sonido de confirmación (opcional)
    try {
      const audio = new Audio('/assets/beep.mp3');
      audio.play().catch(e => console.log("No se pudo reproducir sonido"));
    } catch (e) {
      console.log("Error reproduciendo sonido");
    }
    
    toast.success(`${product.nombre || product.label} añadido al carrito`);
  };

  // Remover del carrito
  const removeFromCart = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // Actualizar cantidad
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    // Verificar stock disponible
    const cartItem = cartItems.find(item => item.id === id);
    const walletItem = wallet.find(w => w.id === id);
    
    if (walletItem && newQuantity > walletItem.cantidad) {
      setError(`No hay suficiente stock para ${cartItem.nombre}`);
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setCartItems(cartItems.map(item => 
      item.id === id 
        ? { ...item, quantity: newQuantity, total: item.precio * newQuantity } 
        : item
    ));
  };

  // Calcular total
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  // Procesar venta
  const processSale = async () => {
    try {
      setLoading(true);
      
      if (cartItems.length === 0) {
        setError("El carrito está vacío");
        return;
      }
      
      const total = calculateTotal();
      const change = amountReceived ? parseFloat(amountReceived) - total : 0;
      
      const saleData = {
        items: cartItems.map(item => ({
          id: item.id,
          nombre: item.nombre,
          precio: item.precio,
          quantity: item.quantity,
          total: item.total
        })),
        total: total,
        paymentMethod: paymentMethod,
        amountReceived: parseFloat(amountReceived) || total,
        change: change,
        clientName: clientName || "Cliente General",
        timestamp: new Date().toISOString()
      };
      
      const result = await apiService.createSale(saleData);
      
      if (result && result.success) {
        toast.success("Venta realizada con éxito");
        setCartItems([]);
        setPaymentMethod('efectivo');
        setAmountReceived('');
        setClientName('');
        setShowPaymentModal(false);
        
        // Recargar el wallet para actualizar el stock
        try {
          const walletResponse = await apiService.getWallet();
          if (walletResponse && walletResponse.wallet) {
            setWallet(walletResponse.wallet);
          }
        } catch (err) {
          console.error("Error recargando wallet después de la venta:", err);
        }
      } else {
        throw new Error(result?.error || "Error al procesar venta");
      }
    } catch (err) {
      console.error("Error procesando venta:", err);
      setError("Error al procesar la venta. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar productos por término de búsqueda
  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (product.nombre && product.nombre.toLowerCase().includes(term)) ||
      (product.label && product.label.toLowerCase().includes(term)) ||
      (product.categoria && product.categoria.toLowerCase().includes(term))
    );
  });

  // JSX del componente
  return (
    <Container fluid className="mt-3">
      {/* Mostrar errores */}
      {error && (
        <Row>
          <Col>
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          </Col>
        </Row>
      )}
      
      {/* Contenido principal */}
      <Row>
        {/* Panel izquierdo - Detección */}
        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Detección de Productos</h4>
              <Form.Check
                type="switch"
                id="continuous-detection"
                label="Detección continua"
                checked={continuousDetection}
                onChange={toggleContinuousDetection}
                disabled={loading}
              />
            </Card.Header>
            
            <Card.Body>
              {/* Área de detección */}
              <div className="text-center mb-4">
                <Button 
                  variant="primary"
                  size="lg"
                  onClick={triggerManualDetection}
                  disabled={loading || continuousDetection}
                  className="d-flex align-items-center mx-auto"
                >
                  {loading ? (
                    <><Spinner size="sm" animation="border" className="me-2" /> Escaneando...</>
                  ) : (
                    <><i className="bi bi-upc-scan me-2"></i> Escanear Producto</>
                  )}
                </Button>
                
                <div className="mt-3 text-muted small">
                  {continuousDetection 
                    ? "Modo continuo activado: acerca los productos a la cámara" 
                    : "Presiona el botón para escanear un producto"}
                </div>
              </div>
              
              {/* Última detección */}
              {lastDetection && (
                <Card className={`mb-4 ${
                  lastAddedProduct && lastAddedProduct.label === lastDetection.label 
                    ? 'last-scanned' 
                    : ''
                }`}>
                  <Card.Header>Última Detección</Card.Header>
                  <Card.Body>
                    <Row>
                      <Col xs={8}>
                        <h5>{lastDetection.label}</h5>
                        <p className="mb-1">
                          Confianza: 
                          <Badge bg={
                            lastDetection.similarity > 85 
                              ? "success" 
                              : lastDetection.similarity > 70
                                ? "warning"
                                : "danger"
                          } className="ms-2">
                            {lastDetection.similarity}%
                          </Badge>
                        </p>
                        <p className="text-muted small">
                          {new Date(lastDetection.timestamp).toLocaleString()}
                        </p>
                      </Col>
                      <Col xs={4} className="d-flex align-items-center justify-content-end">
                        {lastDetection.similarity > 70 && (
                          <Button 
                            variant="outline-primary"
                            size="sm"
                            onClick={() => addDetectedProductToCart(
                              lastDetection.label, 
                              lastDetection.productInfo
                            )}
                          >
                            Añadir al Carrito
                          </Button>
                        )}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}
              
              {/* Productos disponibles */}
              <h5 className="mb-3">Productos Disponibles</h5>
              
              <Form.Control
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-3"
              />
              
              <div className="products-grid" style={{maxHeight: '400px', overflowY: 'auto'}}>
                {filteredProducts.length > 0 ? (
                  <ListGroup>
                    {filteredProducts.map(product => {
                      const walletItem = wallet.find(w => w.id === product.id);
                      const stock = walletItem ? walletItem.cantidad : 0;
                      return (
                        <ListGroup.Item 
                          key={product.id}
                          className="d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <strong>{product.nombre}</strong>
                            <div className="text-muted small">
                              {product.label} - ${product.precio}
                            </div>
                          </div>
                          <div>
                            <Badge bg={stock > 0 ? "success" : "danger"} className="me-2">
                              Stock: {stock}
                            </Badge>
                            {stock > 0 && (
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => addToCart({...product, stock})}
                              >
                                <i className="bi bi-plus"></i>
                              </Button>
                            )}
                          </div>
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                ) : (
                  <p className="text-center text-muted">
                    {products.length === 0 
                      ? "No hay productos registrados" 
                      : "No se encontraron productos con ese término"}
                  </p>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Panel derecho - Carrito */}
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header>
              <h4 className="mb-0">
                Carrito de Compra
                <Badge bg="secondary" className="ms-2">
                  {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'}
                </Badge>
              </h4>
            </Card.Header>
            
            <Card.Body className="d-flex flex-column">
              {/* Tabla de productos en carrito */}
              <div className="flex-grow-1 overflow-auto">
                {cartItems.length > 0 ? (
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>Cantidad</th>
                        <th>Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map(item => (
                        <tr key={item.id} className={
                          lastAddedProduct && lastAddedProduct.id === item.id 
                            ? 'last-scanned' 
                            : ''
                        }>
                          <td>{item.nombre}</td>
                          <td>${item.precio}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Button 
                                variant="outline-secondary" 
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                -
                              </Button>
                              <span className="mx-2">{item.quantity}</span>
                              <Button 
                                variant="outline-secondary" 
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                          </td>
                          <td>${item.total}</td>
                          <td>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center text-muted py-5">
                    <i className="bi bi-cart" style={{ fontSize: '3rem' }}></i>
                    <p className="mt-3">El carrito está vacío</p>
                    <p>Escanea productos o agrégalos manualmente</p>
                  </div>
                )}
              </div>
              
              {/* Sección de total y pago */}
              <div className="mt-4 border-top pt-3">
                <Row>
                  <Col md={6}>
                    <h5>Total: ${calculateTotal().toFixed(2)}</h5>
                  </Col>
                  <Col md={6} className="d-flex justify-content-end">
                    <Button 
                      variant="success" 
                      size="lg"
                      disabled={cartItems.length === 0 || loading}
                      onClick={() => setShowPaymentModal(true)}
                    >
                      <i className="bi bi-cash me-2"></i>
                      Procesar Pago
                    </Button>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Modal de pago */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Procesar Pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Cliente</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Nombre del cliente" 
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Total a Pagar</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={`$${calculateTotal().toFixed(2)}`}
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Método de Pago</Form.Label>
                  <Form.Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                    <option value="transferencia">Transferencia</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Monto Recibido</Form.Label>
                  <Form.Control 
                    type="number" 
                    placeholder="Ingrese el monto"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    disabled={paymentMethod !== 'efectivo'}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            {paymentMethod === 'efectivo' && amountReceived && (
              <Alert variant="info">
                <strong>Cambio a devolver:</strong> ${Math.max(0, (parseFloat(amountReceived) - calculateTotal())).toFixed(2)}
              </Alert>
            )}
            
            <Table striped bordered>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.nombre}</td>
                    <td>${item.precio}</td>
                    <td>{item.quantity}</td>
                    <td>${item.total}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={3} className="text-end">Total:</th>
                  <th>${calculateTotal().toFixed(2)}</th>
                </tr>
              </tfoot>
            </Table>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={processSale}
            disabled={loading || (paymentMethod === 'efectivo' && (!amountReceived || parseFloat(amountReceived) < calculateTotal()))}
          >
            {loading ? (
              <><Spinner size="sm" animation="border" className="me-2" /> Procesando...</>
            ) : (
              'Completar Venta'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Alerta de producto añadido */}
      {lastAddedProduct && (
        <Alert 
          variant="success" 
          className="position-fixed bottom-0 end-0 m-3 d-flex align-items-center fade-out"
          style={{ zIndex: 1050 }}
        >
          <i className="bi bi-check-circle-fill me-2"></i>
          <span>
            <strong>{lastAddedProduct.nombre}</strong> añadido al carrito
          </span>
        </Alert>
      )}
      
      {/* Componente de debug en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          className="position-fixed bottom-0 start-0 m-2 p-2 bg-light rounded shadow-sm" 
          style={{ zIndex: 1000, fontSize: '0.8rem' }}
        >
          <div className="d-flex justify-content-between mb-1">
            <span>Modo Debug</span>
          </div>
          <div>
            <Button 
              variant="outline-secondary" 
              size="sm"
              className="me-1"
              onClick={() => addDetectedProductToCart('botella')}
            >
              Detectar Botella
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm"
              className="me-1"
              onClick={() => addDetectedProductToCart('barrita')}
            >
              Detectar Barrita
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => addDetectedProductToCart('chicle')}
            >
              Detectar Chicle
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
};

export default POSView;