/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import { Table, Spinner, Card, Alert, Button, Row, Col, Form, Badge } from 'react-bootstrap';
import { FaDownload, FaFilter, FaTimes, FaEye, FaCalendarAlt, FaShoppingCart } from 'react-icons/fa';
import apiService from '../../services/apiService';
import { toast } from 'react-toastify';
import InvoiceModal from './InvoiceModal';
import ClientNameModal from './ClientNameModal';
import OrderProductManagementModal from '../orders/OrderProductManagementModal';
import { generateInvoicePDF } from '../../utils/pdfGenerator';

const SalesHistory = memo(({ onGenerateInvoice, onDownloadReport, onSalesDataUpdate }) => {
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
    paymentMethod: ''
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
      // Filtro por método de pago
      if (filters.paymentMethod && 
          sale.paymentMethod !== filters.paymentMethod) {
        return false;
      }
      
      // Filtro por fecha
      const saleDate = new Date(sale.date || sale.fecha || sale.timestamp);
      if (filters.startDate && new Date(filters.startDate) > saleDate) {
        return false;
      }
      
      return true;
    });
    
    setFilteredSales(filtered);
    setDisplayedSales(filtered.slice(0, itemsPerPage)); // Actualizar ventas mostradas
    setHasMoreData(filtered.length > itemsPerPage); // Verificar si hay más datos para cargar
  }, [sales, filters.startDate, filters.paymentMethod, itemsPerPage]);

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
      paymentMethod: ''
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

  // Usar useMemo para formatear las ventas mostradas
  const formattedDisplayedSales = useMemo(() => {
    return displayedSales.map(sale => ({
      ...sale,
      formattedDate: formatDate(sale.date || sale.fecha || sale.timestamp),
      formattedTotal: formatCurrency(sale.total),
      itemsCount: Array.isArray(sale.items) ? sale.items.length : 0
    }));
  }, [displayedSales]);

  // Si hay un error pero no está cargando, mostramos el error
  if (error && !loading) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
        <div className="d-flex justify-content-end">
          <Button 
            variant="outline-danger" 
            size="sm"
            onClick={loadSales}
            className="px-2 py-1"
          >
            Reintentar
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <>
      {/* Header principal */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">Historial de Ventas</h5>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-primary" 
            size="sm" 
            className="px-3 py-2"
            onClick={() => setShowFilters(!showFilters)}
            title={showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          >
            <FaFilter size="12" className="me-1" /> 
            {showFilters ? 'Ocultar' : 'Filtros'}
          </Button>
          <Button 
            variant="outline-secondary" 
            size="sm"
            className="px-3 py-2"
            onClick={loadSales}
            title="Actualizar datos"
          >
            <i className="bi bi-arrow-clockwise" style={{ fontSize: '12px' }} />
            <span className="ms-1">Recargar</span>
          </Button>
        </div>
      </div>

      {/* Panel principal */}
      <Card className="shadow-sm mb-4">
        
        {/* Panel de filtros plegable */}
        {showFilters && (
          <Card.Body className="border-bottom">
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
                    <Form.Label>Método de Pago</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="paymentMethod"
                      value={filters.paymentMethod}
                      onChange={handleFilterChange}
                      placeholder="Efectivo, Tarjeta, etc."
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
        
        {/* Tabla de ventas optimizada */}
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Cargando ventas...</p>
            </div>
          ) : (
            formattedDisplayedSales.length > 0 ? (
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
                  {formattedDisplayedSales.map((sale) => (
                    <SaleRow 
                      key={sale.id || sale._id || `sale-${Math.random()}`}
                      sale={sale}
                      onViewInvoice={handleViewInvoice}
                      onViewProducts={handleViewProducts}
                      onDownloadInvoice={handleDownloadInvoice}
                    />
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="text-center p-5">
                <i className="bi bi-search fs-1 text-muted"></i>
                <p className="mt-3 text-muted">No se encontraron ventas</p>
                {(filters.startDate || filters.paymentMethod) && (
                  <Button 
                    variant="link" 
                    size="sm"
                    onClick={clearFilters}
                    className="p-1"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            )
          )}
        </Card.Body>
        
        {/* Footer con acciones adicionales */}
        <Card.Footer>
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
});

// Componente optimizado para cada fila de venta
const SaleRow = memo(({ sale, onViewInvoice, onViewProducts, onDownloadInvoice }) => (
  <tr>
    <td>
      <Badge bg="primary">{sale.id}</Badge>
    </td>
    <td>
      <FaCalendarAlt className="me-1" />
      {sale.formattedDate}
    </td>
    <td>{sale.client || sale.cliente || 'Cliente general'}</td>
    <td>{sale.itemsCount} productos</td>
    <td>
      <strong>{sale.formattedTotal}</strong>
    </td>
    <td>
      <Badge bg="success">{sale.paymentMethod || 'Desconocido'}</Badge>
    </td>
    <td>
      <Button
        variant="outline-primary"
        size="sm"
        className="me-1"
        onClick={() => onViewInvoice(sale)}
        title="Ver factura"
      >
        <FaEye />
      </Button>
      <Button
        variant="outline-info"
        size="sm"
        className="me-1"
        onClick={() => onViewProducts(sale)}
        title="Ver productos"
      >
        <FaShoppingCart />
      </Button>
      <Button
        variant="outline-success"
        size="sm"
        onClick={() => onDownloadInvoice(sale)}
        title="Descargar PDF"
      >
        <FaDownload />
      </Button>
    </td>
  </tr>
));

SalesHistory.displayName = 'SalesHistory';
SaleRow.displayName = 'SaleRow';

export default SalesHistory;