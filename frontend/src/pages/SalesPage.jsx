import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Card } from 'react-bootstrap';
import { FaDownload, FaChartLine, FaShoppingCart, FaMoneyBillWave } from 'react-icons/fa';
import SalesHistory from '../components/SalesHistory/SalesHistory';
import InvoiceModal from '../components/SalesHistory/InvoiceModal';
import { generateSalesReportPDF } from '../utils/pdfGenerator';
import { toast } from '../utils/toastHelper';

// Estilos
import '../styles/pages/sales.css';

const SalesPage = () => {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  const [salesData, setSalesData] = useState([]); // Estado para almacenar todas las ventas
  
  // Función para formatear moneda de manera consistente en toda la aplicación
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

  // Marcar el componente como montado después de un breve retraso
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComponentMounted(true);
    }, 1000); // Retraso de 1 segundo para asegurar que la carga inicial termine

    return () => clearTimeout(timer);
  }, []);

  // Función para abrir el modal de factura con la venta seleccionada
  const handleShowInvoice = (sale) => {
    setSelectedSale(sale);
    setShowInvoiceModal(true);
  };

  // Función para recibir y almacenar los datos de ventas del componente hijo
  const handleSalesDataUpdate = (sales) => {
    setSalesData(sales || []);
  };

  // Función para descargar todas las ventas como PDF
  const handleDownloadSalesReport = async () => {
    if (!salesData || salesData.length === 0) {
      if (isComponentMounted) {
        toast.warning('No hay ventas para generar el reporte');
      }
      return;
    }

    try {
      setDownloading(true);
      // Mostrar toast solo cuando comienza la descarga
      if (isComponentMounted) {
        toast.info('Generando reporte de ventas...');
      }
      await generateSalesReportPDF(salesData);
      if (isComponentMounted) {
        toast.success('Reporte de ventas descargado correctamente', {
          toastId: 'sales-report-success' // Asegurar ID único para evitar duplicados
        });
      }
    } catch (error) {
      console.error('Error al generar el reporte de ventas:', error);
      if (isComponentMounted) {
        toast.error('Error al generar el reporte. Intente más tarde.');
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="sales-main-container">
      <div className="sales-content-wrapper">
        {/* Header con estilo similar a alertas */}
        <div className="sales-header">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="sales-title">
                <FaShoppingCart className="me-3" />
                Gestión de Ventas
              </h1>
              <p className="sales-subtitle">
                Visualice, analice y administre el historial de transacciones
              </p>
            </div>
            <Button 
              variant="light"
              onClick={handleDownloadSalesReport}
              disabled={downloading || salesData.length === 0}
              className="sales-action-button"
              title="Descargar historial de ventas"
            >
              {downloading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <FaDownload className="me-2" />
                  <span>Descargar Reporte</span>
                </>
              )}
            </Button>
          </div>
          
          {/* Estadísticas de ventas */}
          <div className="sales-stats-grid">
            <div className="sales-stat-card">
              <div className="sales-stat-icon">
                <FaShoppingCart />
              </div>
              <div className="sales-stat-value">
                {salesData.length.toLocaleString('es-MX')}
              </div>
              <div className="sales-stat-label">Total de Ventas</div>
              <small className="text-muted">Transacciones registradas</small>
            </div>
            
            <div className="sales-stat-card">
              <div className="sales-stat-icon" style={{ backgroundColor: 'rgba(40, 167, 69, 0.15)', color: 'var(--bs-success)' }}>
                <FaMoneyBillWave />
              </div>
              <div className="sales-stat-value sales-stat-value-money">
                {salesData.length > 0 
                  ? formatCurrency(salesData.reduce((sum, sale) => sum + (sale.total || 0), 0))
                  : '$0.00'}
              </div>
              <div className="sales-stat-label">Ingresos Totales</div>
              <small className="text-muted">Suma de todas las ventas</small>
            </div>
            
            <div className="sales-stat-card">
              <div className="sales-stat-icon" style={{ backgroundColor: 'rgba(13, 110, 253, 0.15)', color: 'var(--bs-primary)' }}>
                <FaChartLine />
              </div>
              <div className="sales-stat-value sales-stat-value-money">
                {salesData.length > 0 
                  ? formatCurrency(salesData.reduce((sum, sale) => sum + (sale.total || 0), 0) / salesData.length)
                  : '$0.00'}
              </div>
              <div className="sales-stat-label">Valor Promedio</div>
              <small className="text-muted">Por transacción</small>
            </div>
          </div>
        </div>
        
        {/* Contenido principal */}
        <div className="sales-content-container">
          <div className="sales-content-inner">
            <SalesHistory 
              onGenerateInvoice={handleShowInvoice}
              onSalesDataUpdate={handleSalesDataUpdate}
            />
          </div>
        </div>
        
        {/* Modal para mostrar y descargar facturas */}
        <InvoiceModal
          show={showInvoiceModal}
          onHide={() => setShowInvoiceModal(false)}
          sale={selectedSale}
        />
      </div>
    </div>
  );
};

export default SalesPage;