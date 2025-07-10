/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import { Table, Spinner, Card, Alert, Button, Row, Col, Form, Badge } from 'react-bootstrap';
import { FaDownload, FaFilter, FaTimes, FaEye, FaCalendarAlt, FaShoppingCart, FaSearch } from 'react-icons/fa';
import apiService from '../../services/apiService';
import { toast } from 'react-toastify';
import InvoiceModal from './InvoiceModal';
import ClientNameModal from './ClientNameModal';
import OrderProductManagementModal from '../orders/OrderProductManagementModal';
import { generateInvoicePDF } from '../../utils/pdfGenerator';

// Estilos
import '../../styles/components/sales/history.css';

const SalesHistory = memo(({ onGenerateInvoice, onSalesDataUpdate }) => {
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
        toast.error('Error al cargar el historial de ventas', {
          toastId: 'sales-history-load-error'
        });
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
        toast.info('Generando factura PDF...', {
          toastId: `sales-invoice-gen-${saleForInvoice?.id || 'noid'}`
        });
      }
      
      // Crear copia de la venta con el nombre del cliente actualizado
      const updatedSale = {
        ...saleForInvoice,
        client: clientName,
        cliente: clientName
      };
      
      await generateInvoicePDF(updatedSale);
      
      if (isComponentMounted) {
        toast.success(`Factura generada para ${clientName}`, {
          toastId: `sales-invoice-success-${saleForInvoice?.id || 'noid'}`
        });
      }
      
      setShowClientNameModal(false);
      setSaleForInvoice(null);
    } catch (error) {
      console.error('Error al generar factura PDF:', error);
      if (isComponentMounted) {
        toast.error('Error al generar la factura PDF', {
          toastId: `sales-invoice-error-${saleForInvoice?.id || 'noid'}`
        });
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
    
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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

      {/* Panel principal con nuevo diseño */}
      <div className="sales-history-container">
        <h5 className="sales-history-title p-3">
          <FaShoppingCart className="me-2 text-primary" />
          Historial de Ventas
          <Button 
            variant={showFilters ? "outline-primary" : "light"}
            size="sm" 
            className="ms-auto sales-history-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter className="me-1" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>
        </h5>
        
        {/* Panel de filtros plegable con nuevo diseño */}
        {showFilters && (
          <div className="sales-history-filters">
            <Form>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha Inicio</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaCalendarAlt size={14} />
                      </span>
                      <Form.Control 
                        type="date" 
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        className="rounded-end"
                      />
                    </div>
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
                      className="rounded-pill"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              {/* Filtros aplicados */}
              {(filters.startDate || filters.paymentMethod) && (
                <div className="mb-3">
                  {filters.startDate && (
                    <div className="filter-pill">
                      <span>Desde: {filters.startDate}</span>
                      <span 
                        className="filter-pill-close"
                        onClick={() => handleFilterChange({ target: { name: 'startDate', value: '' } })}
                      >
                        <FaTimes size={12} />
                      </span>
                    </div>
                  )}
                  {filters.paymentMethod && (
                    <div className="filter-pill">
                      <span>Método: {filters.paymentMethod}</span>
                      <span 
                        className="filter-pill-close"
                        onClick={() => handleFilterChange({ target: { name: 'paymentMethod', value: '' } })}
                      >
                        <FaTimes size={12} />
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="d-flex justify-content-end">
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={clearFilters}
                  className="sales-history-btn"
                  disabled={!filters.startDate && !filters.paymentMethod}
                >
                  <FaTimes className="me-1" /> Limpiar filtros
                </Button>
                <span className="ms-3 my-auto text-muted">
                  {filteredSales.length} de {sales.length} ventas mostradas
                </span>
              </div>
            </Form>
          </div>
        )}
        
        {/* Tabla de ventas optimizada */}
        <div className="sales-history-table-container">
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Cargando ventas...</p>
            </div>
          ) : (
            formattedDisplayedSales.length > 0 ? (
              <Table responsive hover className="sales-history-table mb-0">
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
              <div className="sales-history-empty">
                <div className="sales-history-empty-icon">
                  <FaSearch />
                </div>
                <p>No se encontraron ventas</p>
                {(filters.startDate || filters.paymentMethod) && (
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={clearFilters}
                    className="sales-history-btn mt-2"
                  >
                    <FaTimes className="me-1" /> Limpiar filtros
                  </Button>
                )}
              </div>
            )
          )}
        </div>
        
        {/* Footer con acciones adicionales */}
        <div className="sales-history-footer">
          <div>
            <small className="text-muted">
              Total de ventas: <strong>{filteredSales.length}</strong>
            </small>
          </div>
          <div>
            {hasMoreData && (
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={loadMoreSales}
                disabled={loadingMore}
                className="sales-history-btn"
              >
                {loadingMore ? 'Cargando más...' : 'Cargar más ventas'}
              </Button>
            )}
          </div>
        </div>
      </div>

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

// Componente optimizado para cada fila de venta con nuevo diseño
const SaleRow = memo(({ sale, onViewInvoice, onViewProducts, onDownloadInvoice }) => (
  <tr>
    <td>
      <Badge bg="primary" pill className="px-2 py-1">{sale.id}</Badge>
    </td>
    <td>
      <div className="d-flex align-items-center">
        <div className="me-2 rounded-circle p-1" style={{ backgroundColor: 'rgba(13, 110, 253, 0.1)' }}>
          <FaCalendarAlt size={12} className="text-primary" />
        </div>
        <span>{sale.formattedDate}</span>
      </div>
    </td>
    <td>
      <div className="d-inline-block text-truncate" style={{ maxWidth: "150px" }}>
        {sale.client || sale.cliente || 'Cliente general'}
      </div>
    </td>
    <td>
      <Badge bg="light" text="dark" pill className="px-2 py-1">
        {sale.itemsCount} productos
      </Badge>
    </td>
    <td>
      <span className="fw-bold text-success" style={{ fontSize: '1.05rem', letterSpacing: '0.3px' }}>{sale.formattedTotal}</span>
    </td>
    <td>
      <Badge bg="success" pill className="px-2 py-1">{sale.paymentMethod || 'Desconocido'}</Badge>
    </td>
    <td>
      <div className="d-flex">
        <Button
          variant="outline-primary"
          size="sm"
          className="me-1 rounded-circle p-1"
          style={{ width: "30px", height: "30px" }}
          onClick={() => onViewInvoice(sale)}
          title="Ver factura"
        >
          <FaEye size={14} />
        </Button>
        <Button
          variant="outline-info"
          size="sm"
          className="me-1 rounded-circle p-1"
          style={{ width: "30px", height: "30px" }}
          onClick={() => onViewProducts(sale)}
          title="Ver productos"
        >
          <FaShoppingCart size={14} />
        </Button>
        <Button
          variant="outline-success"
          size="sm"
          className="rounded-circle p-1"
          style={{ width: "30px", height: "30px" }}
          onClick={() => onDownloadInvoice(sale)}
          title="Descargar PDF"
        >
          <FaDownload size={14} />
        </Button>
      </div>
    </td>
  </tr>
));

SalesHistory.displayName = 'SalesHistory';
SaleRow.displayName = 'SaleRow';

export default SalesHistory;