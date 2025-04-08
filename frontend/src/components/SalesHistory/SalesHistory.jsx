import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Card, Alert, Button, Row, Col, Form } from 'react-bootstrap';
import { FaFileInvoice, FaDownload, FaFilter, FaSearch, FaTimes } from 'react-icons/fa';
import apiService from '../../services/apiService';
import { toast } from 'react-toastify';

const SalesHistory = ({ onGenerateInvoice, onDownloadReport }) => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    clientName: '',
    minAmount: '',
    maxAmount: ''
  });
  
  // Estado para controlar el panel de filtros
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadSales();
  }, [onDownloadReport]);

  useEffect(() => {
    // Aplicar filtros cada vez que cambien
    applyFilters();
  }, [sales, filters]);

  const loadSales = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener ventas
      const salesData = await apiService.getSales();
      
      // Verificar que salesData sea un array
      if (Array.isArray(salesData)) {
        console.log('Ventas cargadas correctamente:', salesData.length);
        setSales(salesData);
        setFilteredSales(salesData);
        
        // Pasar las ventas al componente padre para disponibilidad inmediata
        if (typeof onDownloadReport === 'function') {
          onDownloadReport(salesData);
        }
      } else {
        console.error('getSales no devolvió un array:', salesData);
        setSales([]);
        setFilteredSales([]);
        setError('La respuesta del servidor no tiene el formato esperado');
      }
    } catch (err) {
      console.error('Error al cargar ventas:', err);
      setError(err.message || 'Error al cargar el historial de ventas');
      setSales([]);
      setFilteredSales([]);
      toast.error('Error al cargar el historial de ventas');
    } finally {
      setLoading(false);
    }
  };

  // Función para aplicar filtros
  const applyFilters = () => {
    if (!Array.isArray(sales)) return;
    
    const filtered = sales.filter(sale => {
      // Filtro por cliente
      if (filters.clientName && 
          !String(sale.client || sale.cliente || '').toLowerCase().includes(filters.clientName.toLowerCase())) {
        return false;
      }
      
      // Filtro por monto
      const total = sale.total || 0;
      if (filters.minAmount && total < parseFloat(filters.minAmount)) {
        return false;
      }
      if (filters.maxAmount && total > parseFloat(filters.maxAmount)) {
        return false;
      }
      
      // Filtro por fecha
      const saleDate = new Date(sale.date || sale.fecha || sale.timestamp);
      if (filters.startDate && new Date(filters.startDate) > saleDate) {
        return false;
      }
      if (filters.endDate && new Date(filters.endDate) < saleDate) {
        return false;
      }
      
      return true;
    });
    
    setFilteredSales(filtered);
  };

  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Limpiar todos los filtros
  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      clientName: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha desconocida';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (e) {
      return 'Fecha inválida';
    }
  };
  
  // Función para formatear método de pago
  const formatPaymentMethod = (method) => {
    if (!method) return 'Desconocido';
    
    const methods = {
      'efectivo': 'Efectivo',
      'tarjeta': 'Tarjeta',
      'transferencia': 'Transferencia'
    };
    
    return methods[method.toLowerCase()] || method;
  };

  // Si hay un error pero no está cargando, mostramos el error
  if (error && !loading) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
        <div className="d-flex justify-content-end">
          <Button variant="outline-danger" onClick={loadSales}>
            Reintentar
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <>
      {/* Instrucciones */}
      <Card className="mb-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0">
            <i className="bi bi-info-circle me-2"></i>
            Instrucciones para la Gestión de Ventas
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={8}>
              <ol>
                <li className="mb-2">Utilice los filtros para buscar ventas específicas por fecha, cliente o monto.</li>
                <li className="mb-2">Revise los detalles de cada venta en la tabla principal.</li>
                <li className="mb-2">Genere facturas individuales haciendo clic en el botón "Factura".</li>
                <li className="mb-2">Exporte todos los datos para análisis detallados con el botón de descarga.</li>
                <li>Actualice los datos en cualquier momento con el botón "Actualizar".</li>
              </ol>
            </Col>
            <Col md={4}>
              <Alert variant="info" className="h-100 mb-0 d-flex align-items-center">
                <div>
                  <i className="bi bi-lightbulb-fill me-2 fs-4"></i>
                  <strong>Consejos:</strong>
                  <p className="mb-0 mt-2">
                    Para un análisis más efectivo, utilice los filtros por rangos de fechas. Las ventas más recientes aparecen primero en la lista. Puede generar facturas individuales para cada transacción.
                  </p>
                </div>
              </Alert>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Panel principal */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Historial de Ventas</h5>
          <div>
            <Button 
              variant="outline-primary" 
              size="sm" 
              className="me-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter className="me-1" /> 
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={loadSales}
            >
              <i className="bi bi-arrow-clockwise me-1"></i> Actualizar
            </Button>
          </div>
        </Card.Header>
        
        {/* Panel de filtros plegable */}
        {showFilters && (
          <Card.Body className="bg-light border-bottom">
            <Form>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha Inicio</Form.Label>
                    <Form.Control 
                      type="date" 
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha Fin</Form.Label>
                    <Form.Control 
                      type="date" 
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label>Monto Mínimo</Form.Label>
                    <Form.Control 
                      type="number" 
                      name="minAmount"
                      value={filters.minAmount}
                      onChange={handleFilterChange}
                      placeholder="$"
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label>Monto Máximo</Form.Label>
                    <Form.Control 
                      type="number" 
                      name="maxAmount"
                      value={filters.maxAmount}
                      onChange={handleFilterChange}
                      placeholder="$"
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label>Cliente</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="clientName"
                      value={filters.clientName}
                      onChange={handleFilterChange}
                      placeholder="Nombre"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="d-flex justify-content-end">
                <Button 
                  variant="link" 
                  size="sm"
                  onClick={clearFilters}
                  className="text-danger"
                >
                  <FaTimes className="me-1" /> Limpiar filtros
                </Button>
                <span className="ms-3 text-muted">
                  {filteredSales.length} de {sales.length} ventas mostradas
                </span>
              </div>
            </Form>
          </Card.Body>
        )}
        
        {/* Tabla de ventas */}
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Cargando ventas...</p>
            </div>
          ) : (
            Array.isArray(filteredSales) && filteredSales.length > 0 ? (
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Método</th>
                    <th className="text-end">Total</th>
                    <th>Productos</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale.id || sale._id || `sale-${Math.random()}`}>
                      <td>#{sale.id || sale._id || 'N/A'}</td>
                      <td>{formatDate(sale.date || sale.fecha || sale.timestamp)}</td>
                      <td>{sale.client || sale.cliente || 'Cliente general'}</td>
                      <td>{formatPaymentMethod(sale.paymentMethod || sale.metodoPago)}</td>
                      <td className="text-end fw-bold">${(sale.total || 0).toFixed(2)}</td>
                      <td>
                        {Array.isArray(sale.items) ? (
                          <ul className="mb-0 ps-3">
                            {sale.items.slice(0, 3).map((item, index) => (
                              <li key={index}>
                                {item.nombre || item.name}: {item.cantidad || item.quantity} x ${(item.precioUnitario || item.price || 0).toFixed(2)}
                              </li>
                            ))}
                            {sale.items.length > 3 && (
                              <li>...y {sale.items.length - 3} más</li>
                            )}
                          </ul>
                        ) : (
                          <span className="text-muted">Sin detalles</span>
                        )}
                      </td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          className="me-2"
                          onClick={() => onGenerateInvoice && onGenerateInvoice(sale)}
                        >
                          <FaFileInvoice className="me-1" /> Factura
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="text-center p-5">
                <i className="bi bi-search fs-1 text-muted"></i>
                <p className="mt-3 text-muted">No se encontraron ventas</p>
                {(filters.startDate || filters.endDate || filters.clientName || 
                  filters.minAmount || filters.maxAmount) && (
                  <Button variant="link" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                )}
              </div>
            )
          )}
        </Card.Body>
        
        {/* Footer con acciones adicionales */}
        <Card.Footer className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <small className="text-muted">
                Total de ventas: <strong>{filteredSales.length}</strong>
              </small>
            </div>
            <div>
              <Button 
                variant="outline-success" 
                size="sm"
                onClick={() => onDownloadReport && onDownloadReport(filteredSales)}
              >
                <FaDownload className="me-1" /> Exportar datos
              </Button>
            </div>
          </div>
        </Card.Footer>
      </Card>
    </>
  );
};

export default SalesHistory;