/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Table, Spinner, Card, Alert, Button, Row, Col, Form, Badge } from 'react-bootstrap';
import { FaDownload, FaFilter, FaTimes, FaEye, FaCalendarAlt, FaShoppingCart } from 'react-icons/fa';
import apiService from '../../services/apiService';
import { toast } from 'react-toastify';
import InvoiceModal from './InvoiceModal';
import ClientNameModal from './ClientNameModal';
import OrderProductManagementModal from '../orders/OrderProductManagementModal';
import { generateInvoicePDF } from '../../utils/pdfGenerator';

const SalesHistory = ({ onGenerateInvoice, onDownloadReport, onSalesDataUpdate }) => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [displayedSales, setDisplayedSales] = useState([]); // Nuevas ventas mostradas
  const [selectedSale, setSelectedSale] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showClientNameModal, setShowClientNameModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [saleForInvoice, setSaleForInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false); // Loading para cargar más
  const [error, setError] = useState(null);
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  const [hasMoreData, setHasMoreData] = useState(true);
  
  // Usar useRef para mantener una referencia estable a onSalesDataUpdate
  const onSalesDataUpdateRef = useRef(onSalesDataUpdate);
  
  // Actualizar la referencia cuando cambie la prop
  useEffect(() => {
    onSalesDataUpdateRef.current = onSalesDataUpdate;
  }, [onSalesDataUpdate]);

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

  // Función para cargar ventas - SIN onSalesDataUpdate en dependencias
  const loadSales = useCallback(async () => {
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
        setDisplayedSales(salesData.slice(0, itemsPerPage)); // Mostrar solo las primeras ventas por página
        
        // Enviar los datos al componente padre usando la referencia estable
        if (typeof onSalesDataUpdateRef.current === 'function') {
          onSalesDataUpdateRef.current(salesData);
        }
      } else {
        console.error('getSales no devolvió un array:', salesData);
        setSales([]);
        setFilteredSales([]);
        setError('La respuesta del servidor no tiene el formato esperado');
        
        // Informar al padre que no hay datos
        if (typeof onSalesDataUpdateRef.current === 'function') {
          onSalesDataUpdateRef.current([]);
        }
      }
    } catch (err) {
      console.error('Error al cargar ventas:', err);
      setError(err.message || 'Error al cargar el historial de ventas');
      setSales([]);
      setFilteredSales([]);
      
      // Informar al padre que no hay datos debido al error
      if (typeof onSalesDataUpdateRef.current === 'function') {
        onSalesDataUpdateRef.current([]);
      }
      
      // Solo mostrar toast si el componente ya se ha montado completamente
      if (isComponentMounted) {
        toast.error('Error al cargar el historial de ventas');
      }
    } finally {
      setLoading(false);
      // Marcar el componente como montado después de la primera carga
      if (!isComponentMounted) {
        setTimeout(() => {
          setIsComponentMounted(true);
        }, 500);
      }
    }
  }, [isComponentMounted]); // Solo isComponentMounted como dependencia

  // Función para aplicar filtros - declarada antes de los useEffect
  const applyFilters = useCallback(() => {
    if (!Array.isArray(sales)) return;
    
    let filtered = sales.filter(sale => {
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
    setDisplayedSales(filtered.slice(0, itemsPerPage)); // Actualizar ventas mostradas
    setHasMoreData(filtered.length > itemsPerPage); // Verificar si hay más datos para cargar
  }, [sales, filters.clientName, filters.minAmount, filters.maxAmount, filters.startDate, filters.endDate, itemsPerPage]);

  // Función para cargar más ventas
  const loadMoreSales = async () => {
    if (loadingMore || !hasMoreData) return;
    
    setLoadingMore(true);
    
    // Simular carga de más datos
    setTimeout(() => {
      setDisplayedSales(prev => [
        ...prev,
        ...filteredSales.slice(prev.length, prev.length + itemsPerPage)
      ]);
      
      // Verificar si hay más datos
      if (displayedSales.length + itemsPerPage >= filteredSales.length) {
        setHasMoreData(false);
      }
      
      setLoadingMore(false);
    }, 1000);
  };

  // useEffect para cargar ventas al montar el componente
  useEffect(() => {
    loadSales();
  }, [loadSales]);

  // useEffect para aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Limpiar todos los filtros
  const clearFilters = () => {
    setFilters({
      startDate: '',
      clientName: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  const handleViewInvoice = (sale) => {
    setSelectedSale(sale);
    setShowInvoiceModal(true);
  };

  const handleViewProducts = (sale) => {
    setSelectedSale(sale);
    setShowProductModal(true);
  };

  const handleDownloadInvoice = (sale) => {
    setSaleForInvoice(sale);
    setShowClientNameModal(true);
  };

  const handleConfirmClientName = async (clientName) => {
    try {
      setGeneratingPDF(true);
      
      if (isComponentMounted) {
        toast.info('Generando factura PDF...');
      }
      
      // Crear copia de la venta con el nombre del cliente actualizado
      const updatedSale = {
        ...saleForInvoice,
        client: clientName,
        cliente: clientName
      };
      
      await generateInvoicePDF(updatedSale);
      
      if (isComponentMounted) {
        toast.success(`Factura generada para ${clientName}`);
      }
      
      setShowClientNameModal(false);
      setSaleForInvoice(null);
    } catch (error) {
      console.error('Error al generar factura PDF:', error);
      if (isComponentMounted) {
        toast.error('Error al generar la factura PDF');
      }
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleCloseClientNameModal = () => {
    setShowClientNameModal(false);
    setSaleForInvoice(null);
    setGeneratingPDF(false);
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
            Array.isArray(displayedSales) && displayedSales.length > 0 ? (
              <Table responsive striped hover className="mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Método de Pago</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedSales.map((sale) => (
                    <tr key={sale.id || sale._id || `sale-${Math.random()}`}>
                      <td>
                        <Badge bg="primary">{sale.id}</Badge>
                      </td>
                      <td>
                        <FaCalendarAlt className="me-1" />
                        {formatDate(sale.date || sale.fecha || sale.timestamp)}
                      </td>
                      <td>{sale.client || sale.cliente || 'Cliente general'}</td>
                      <td>{Array.isArray(sale.items) ? `${sale.items.length} productos` : 'Sin detalles'}</td>
                      <td>
                        <strong>{formatCurrency(sale.total)}</strong>
                      </td>
                      <td>
                        <Badge bg="success">{sale.paymentMethod || 'Desconocido'}</Badge>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleViewInvoice(sale)}
                          title="Ver factura"
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="outline-info"
                          size="sm"
                          className="me-1"
                          onClick={() => handleViewProducts(sale)}
                          title="Ver productos"
                        >
                          <FaShoppingCart />
                        </Button>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleDownloadInvoice(sale)}
                          title="Descargar PDF"
                        >
                          <FaDownload />
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
              {hasMoreData && (
                <Button 
                  variant="link" 
                  size="sm"
                  onClick={loadMoreSales}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Cargando más...' : 'Cargar más ventas'}
                </Button>
              )}
            </div>
          </div>
        </Card.Footer>
      </Card>

      {/* Modal de factura */}
      <InvoiceModal
        show={showInvoiceModal}
        onHide={() => setShowInvoiceModal(false)}
        sale={selectedSale}
      />

      {/* Modal para nombre del cliente */}
      <ClientNameModal
        show={showClientNameModal}
        onHide={handleCloseClientNameModal}
        onConfirm={handleConfirmClientName}
        loading={generatingPDF}
      />

      {/* Modal para gestión de productos - CORREGIDO */}
      <OrderProductManagementModal
        show={showProductModal}
        onHide={() => setShowProductModal(false)}
        products={selectedSale?.items || []}
        orderInfo={{
          id: selectedSale?.id,
          fecha: selectedSale?.date || selectedSale?.fecha || selectedSale?.timestamp,
          metodoPago: selectedSale?.paymentMethod,
          montoRecibido: selectedSale?.amountReceived,
          cambio: selectedSale?.change,
          cliente: selectedSale?.client || selectedSale?.cliente
        }}
        onUpdate={loadSales}
      />
    </>
  );
};

export default SalesHistory;