import React from 'react';
import { Card, Button, Form, Spinner, Badge, ListGroup } from 'react-bootstrap';

const ProductDetectionPanel = ({
  loading,
  continuousDetection,
  toggleContinuousDetection,
  triggerManualDetection,
  lastDetection,
  addDetectedProductToCart,
  lastAddedProduct,
  filteredProducts,
  searchTerm,
  setSearchTerm,
  addToCart
}) => {
  return (
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
            onClick={triggerManualDetection} // Ensure this is a direct function reference
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
          <Card className={`mb-4 ${lastAddedProduct && lastAddedProduct.label === lastDetection.label
            ? 'last-scanned'
            : ''
            }`}>
            <Card.Header>Última Detección</Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
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
                </div>
                <div>
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
                </div>
              </div>
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

        <div className="products-grid" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {loading ? (
            <div className="text-center p-3">
              <Spinner animation="border" />
              <p className="mt-2">Cargando productos...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <ListGroup>
              {filteredProducts.map(product => (
                <ListGroup.Item
                  key={product.id}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <strong>{product.nombre}</strong>
                    <div className="text-muted small">
                      {product.label} - ${product.precio || 0}
                    </div>
                  </div>
                  <div>
                    <Badge bg={product.stock > 0 ? "success" : "danger"} className="me-2">
                      Stock: {product.stock || 0}
                    </Badge>
                    {product.stock > 0 && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => addToCart(product)}
                      >
                        <i className="bi bi-plus"></i>
                      </Button>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p className="text-center text-muted">
              {filteredProducts.length === 0
                ? "No hay productos registrados"
                : "No se encontraron productos con ese término"}
            </p>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductDetectionPanel;