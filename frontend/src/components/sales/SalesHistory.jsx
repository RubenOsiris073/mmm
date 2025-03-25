import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, Modal, Spinner, Alert } from 'react-bootstrap';
import apiService from '../../services/apiService';

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  // Cargar ventas
  useEffect(() => {
    const loadSales = async () => {
      try {
        setLoading(true);
        const salesData = await apiService.getSales();
        setSales(salesData);
      } catch (err) {
        console.error("Error cargando ventas:", err);
        setError("Error al cargar historial de ventas");
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, []);

  // Ver detalles de una venta
  const viewSaleDetails = async (saleId) => {
    try {
      setLoading(true);
      const saleDetails = await apiService.getSaleDetails(saleId);
      setSelectedSale(saleDetails);
      setShowSaleModal(true);
    } catch (err) {
      console.error("Error cargando detalles de venta:", err);
      setError("Error al cargar detalles de venta");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar ventas por fecha
  const filterSalesByDate = () => {
    if (!dateFilter.startDate && !dateFilter.endDate) {
      return sales;
    }
    
    return sales.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      let matchesStart = true;
      let matchesEnd = true;
      
      if (dateFilter.startDate) {
        const startDate = new Date(dateFilter.startDate);
        matchesStart = saleDate >= startDate;
      }
      
      if (dateFilter.endDate) {
        const endDate = new Date(dateFilter.endDate);
        endDate.setHours(23, 59, 59);
        matchesEnd = saleDate <= endDate;
      }
      
      return matchesStart && matchesEnd;
    });
  };

  // Formatear precio
  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const filteredSales = filterSalesByDate();

  return (
    <Container fluid className="sales-history">
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Historial de Ventas</h4>
          <div className="d-flex">
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => window.print()}
              className="me-2"
            >
              Imprimir Reporte
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Row className="mb-4">
            <Col md={5}>
              <Form.Group>
                <Form.Label>Desde</Form.Label>
                <Form.Control 
                  type="date" 
                  value={dateFilter.startDate}
                  onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={5}>
              <Form.Group>
                <Form.Label>Hasta</Form.Label>
                <Form.Control 
                  type="date" 
                  value={dateFilter.endDate}
                  onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Label>&nbsp;</Form.Label>
              <div className="d-grid">
                <Button 
                  variant="outline-secondary"
                  onClick={() => setDateFilter({ startDate: '', endDate: '' })}
                >
                  Limpiar
                </Button>
              </div>
            </Col>
          </Row>
          
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" />
              <p className="mt-2">Cargando ventas...</p>
            </div>
          ) : filteredSales.length === 0 ? (
            <Alert variant="info">
              No hay ventas registradas en el período seleccionado.
            </Alert>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>ID Venta</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Método de Pago</th>
                  <th>Productos</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map(sale => (
                  <tr key={sale.id}>
                    <td>{sale.id.slice(-6)}</td>
                    <td>{new Date(sale.timestamp).toLocaleString()}</td>
                    <td>{sale.clientInfo?.name || 'Cliente General'}</td>
                    <td>
                      <Badge bg={
                        sale.paymentMethod === 'efectivo' ? 'success' :
                        sale.paymentMethod === 'tarjeta' ? 'primary' : 'info'
                      }>
                        {sale.paymentMethod === 'efectivo' ? 'Efectivo' :
                         sale.paymentMethod === 'tarjeta' ? 'Tarjeta' : 'Transferencia'}
                      </Badge>
                    </td>
                    <td>{sale.items?.length || 0} items</td>
                    <td>{formatPrice(sale.total)}</td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => viewSaleDetails(sale.id)}
                      >
                        Ver Detalles
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          
          <div className="mt-3">
            <p>Total de Ventas: {filteredSales.length}</p>
            <p>
              Ingresos Totales: {formatPrice(
                filteredSales.reduce((sum, sale) => sum + sale.total, 0)
              )}
            </p>
          </div>
        </Card.Body>
      </Card>
      
      {/* Modal de Detalles de Venta */}
      <Modal show={showSaleModal} onHide={() => setShowSaleModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalles de Venta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSale && (
            <div className="sale-details">
              <div className="mb-4">
                <Row>
                  <Col md={6}>
                    <p><strong>ID Venta:</strong> {selectedSale.id}</p>
                    <p><strong>Fecha:</strong> {new Date(selectedSale.timestamp).toLocaleString()}</p>
                    <p><strong>Cliente:</strong> {selectedSale.clientInfo?.name || 'Cliente General'}</p>
                    {selectedSale.clientInfo?.email && (
                      <p><strong>Email:</strong> {selectedSale.clientInfo.email}</p>
                    )}
                    {selectedSale.clientInfo?.phone && (
                      <p><strong>Teléfono:</strong> {selectedSale.clientInfo.phone}</p>
                    )}
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Método de Pago:</strong> {
                        selectedSale.paymentMethod === 'efectivo' ? 'Efectivo' :
                        selectedSale.paymentMethod === 'tarjeta' ? 'Tarjeta de Crédito' : 'Transferencia'
                      }
                    </p>
                    <p><strong>Estado:</strong> Completada</p>
                    <p><strong>Total:</strong> {formatPrice(selectedSale.total)}</p>
                  </Col>
                </Row>
              </div>
              
              <h5>Productos</h5>
              <Table striped className="mb-4">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSale.items.map((item, i) => (
                    <tr key={i}>
                      <td>{item.nombre}</td>
                      <td>{item.quantity}</td>
                      <td>{formatPrice(item.precio)}</td>
                      <td>{formatPrice(item.precio * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan="3" className="text-end">Total:</th>
                    <th>{formatPrice(selectedSale.total)}</th>
                  </tr>
                </tfoot>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSaleModal(false)}>
            Cerrar
          </Button>
          <Button variant="outline-secondary" onClick={() => window.print()}>
            Imprimir
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SalesHistory;