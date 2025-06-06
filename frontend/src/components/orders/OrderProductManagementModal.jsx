import React, { useState } from 'react';
import { Modal, Button, Alert, Badge, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';

const OrderProductManagementModal = ({ 
  show, 
  onHide, 
  products = [], // Lista de productos en la orden
  orderInfo = {} // Información de la orden
}) => {
  const [loading] = useState(false);
  const [error, setError] = useState(null);

  const handleClose = () => {
    setError(null);
    onHide();
  };

  // Función para formatear moneda
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '$0.00';
    }
    
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(amount));
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha desconocida';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CO') + ' ' + date.toLocaleTimeString();
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  // Calcular totales
  const calculateTotals = () => {
    const subtotal = products.reduce((sum, product) => {
      const precio = product.precio || product.precioUnitario || product.price || 0;
      const cantidad = product.cantidad || product.quantity || 1;
      return sum + (precio * cantidad);
    }, 0);
    
    const tax = subtotal * 0.16; // 16% IVA
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

  const { subtotal, tax, total } = calculateTotals();

  if (!show) return null;

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-receipt me-2"></i>
          Detalles de los Productos de la Venta
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {/* Información de la orden */}
        <div className="p-3 bg-light rounded mb-4">
          <div className="row">
            <div className="col-md-8">
              <h6 className="mb-2">
                <i className="bi bi-calendar me-2"></i>
                Fecha: {formatDate(orderInfo.fecha)}
              </h6>
              <h6 className="mb-2">
                <i className="bi bi-hash me-2"></i>
                Venta ID: #{orderInfo.id || 'N/A'}
              </h6>
              {orderInfo.cliente && (
                <h6 className="mb-2">
                  <i className="bi bi-person me-2"></i>
                  Cliente: {orderInfo.cliente}
                </h6>
              )}
            </div>
            <div className="col-md-4 text-md-end">
              <Badge bg="primary" className="fs-6">
                {products.length} producto{products.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {/* Lista de productos en formato tabla - mejorada */}
        {products.length > 0 ? (
          <div className="mb-4">
            <h6 className="mb-3">
              <i className="bi bi-list-ul me-2"></i>
              Productos en la Venta
            </h6>
            <Table responsive className="mb-0">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th className="text-center">Cantidad</th>
                  <th className="text-end">Precio Unitario</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => {
                  const precio = product.precio || product.precioUnitario || product.price || 0;
                  const cantidad = product.cantidad || product.quantity || 1;
                  const totalItem = product.total || (precio * cantidad);
                  
                  return (
                    <tr key={product.id || index}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="product-icon me-2">
                            📦
                          </div>
                          <div>
                            <div className="fw-bold text-capitalize">
                              {product.nombre || product.name || product.label || 'Producto sin nombre'}
                            </div>
                            {product.descripcion && (
                              <small className="text-muted">
                                {product.descripcion}
                              </small>
                            )}
                            {product.codigo && (
                              <div>
                                <Badge bg="outline-secondary" className="mt-1">
                                  {product.codigo}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <Badge bg="info">
                          {cantidad} {product.unidadMedida || 'unidades'}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <Badge bg="success">
                          {formatCurrency(precio)}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <strong>
                          {formatCurrency(totalItem)}
                        </strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="text-center p-4 border rounded">
            <i className="bi bi-cart-x display-4 text-muted"></i>
            <h5 className="mt-3">No hay productos en esta venta</h5>
            <p className="text-muted">La venta está vacía o no se han cargado los productos.</p>
          </div>
        )}

        {/* Resumen de totales - mejorado */}
        {products.length > 0 && (
          <div className="border-top pt-3">
            <div className="row">
              <div className="col-md-6 offset-md-6">
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <td className="text-end"><strong>Subtotal:</strong></td>
                      <td className="text-end">{formatCurrency(subtotal)}</td>
                    </tr>
                    <tr>
                      <td className="text-end"><strong>IVA (16%):</strong></td>
                      <td className="text-end">{formatCurrency(tax)}</td>
                    </tr>
                    <tr className="border-top">
                      <td className="text-end"><strong>Total:</strong></td>
                      <td className="text-end">
                        <h5 className="mb-0 text-primary">
                          {formatCurrency(total)}
                        </h5>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Información de pago - mejorada */}
        {orderInfo.metodoPago && (
          <div className="mt-3 p-3 bg-info bg-opacity-10 rounded">
            <h6 className="mb-2">
              <i className="bi bi-credit-card me-2"></i>
              Información de Pago
            </h6>
            <div className="row">
              <div className="col-md-6">
                <strong>Método:</strong> 
                <Badge bg="success" className="ms-2">
                  {orderInfo.metodoPago}
                </Badge>
              </div>
              {orderInfo.montoRecibido && (
                <div className="col-md-6">
                  <strong>Monto recibido:</strong> {formatCurrency(orderInfo.montoRecibido)}
                </div>
              )}
            </div>
            {orderInfo.cambio && orderInfo.cambio > 0 && (
              <div className="mt-2">
                <strong>Cambio:</strong> 
                <span className="text-success fw-bold ms-2">
                  {formatCurrency(orderInfo.cambio)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Notas adicionales */}
        <div className="mt-4 p-3 bg-light rounded">
          <h6 className="mb-2">
            <i className="bi bi-info-circle me-2"></i>
            Resumen de la Venta
          </h6>
          <p className="mb-1">
            <strong>Productos:</strong> {products.length} artículo{products.length !== 1 ? 's' : ''} vendido{products.length !== 1 ? 's' : ''}
          </p>
          <p className="mb-1">
            <strong>Fecha de venta:</strong> {formatDate(orderInfo.fecha)}
          </p>
          <p className="mb-0">
            <strong>Total final:</strong> {formatCurrency(orderInfo.total || total)}
          </p>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleClose} disabled={loading}>
          <i className="bi bi-x-circle me-1"></i>
          Cerrar
        </Button>
        
        {/* Botones de acción adicionales */}
        <Button 
          variant="outline-primary" 
          onClick={() => window.print()}
          disabled={loading}
          title="Imprimir orden"
        >
          <i className="bi bi-printer me-1"></i>
          Imprimir
        </Button>
        
        {products.length > 0 && (
          <Button 
            variant="success" 
            disabled={loading}
            title="Generar factura"
            onClick={() => {
              toast.info('Funcionalidad de generación de PDF próximamente disponible');
            }}
          >
            <i className="bi bi-file-earmark-pdf me-1"></i>
            Generar PDF
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default OrderProductManagementModal;