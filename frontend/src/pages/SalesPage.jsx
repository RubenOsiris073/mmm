import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Card } from 'react-bootstrap';
import { FaDownload } from 'react-icons/fa';
import SalesHistory from '../components/SalesHistory/SalesHistory';
import InvoiceModal from '../components/SalesHistory/InvoiceModal';
import { generateSalesReportPDF } from '../utils/pdfGenerator';
import { toast } from 'react-toastify';

const SalesPage = () => {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  const [salesData, setSalesData] = useState([]); // Estado para almacenar todas las ventas

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
      await generateSalesReportPDF(salesData);
      if (isComponentMounted) {
        toast.success('Reporte de ventas descargado correctamente');
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
    <>
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h1 className="mb-0">Gestión de Ventas</h1>
                  <p className="text-muted">
                    Visualice, descargue y genere facturas de sus ventas
                  </p>
                </div>
                <Button 
                  variant="primary"
                  onClick={handleDownloadSalesReport}
                  disabled={downloading || salesData.length === 0}
                  className="d-flex align-items-center"
                >
                  {downloading ? (
                    <>Generando PDF...</>
                  ) : (
                    <>
                      <FaDownload className="me-2" /> Descargar Historial
                    </>
                  )}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <SalesHistory 
            onGenerateInvoice={handleShowInvoice}
            onDownloadReport={handleDownloadSalesReport}
            onSalesDataUpdate={handleSalesDataUpdate}
          />
        </Col>
      </Row>

      {/* Modal para mostrar y descargar facturas */}
      <InvoiceModal
        show={showInvoiceModal}
        onHide={() => setShowInvoiceModal(false)}
        sale={selectedSale}
      />
    </>
  );
};

export default SalesPage;