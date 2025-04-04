import React, { useState, useCallback } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import BarcodeScanner from './BarcodeScanner';
import { saveProductDetails } from '../../services/storageService';
import '../../App.css';

const AutomaticRegistration = ({ onProductRegistered }) => {
  const [showScanner, setShowScanner] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBarcodeScan = useCallback(async (barcode) => {
    try {
      setIsProcessing(true);
      setError('');
      
      console.log('Código de barras escaneado:', barcode);
      
      const productDetails = await fetchProductDetails(barcode);
      
      if (productDetails) {
        await saveProductDetails({
          ...productDetails,
          fechaRegistro: new Date().toISOString(),
          tipo: 'automatico',
          codigoBarras: barcode
        });
        
        setSuccess(`Producto "${productDetails.nombre}" registrado exitosamente`);
        onProductRegistered();
      } else {
        setError('No se encontraron detalles para este código de barras');
      }
    } catch (error) {
      console.error('Error al procesar el código de barras:', error);
      setError('Error al procesar el código de barras: ' + error.message);
    } finally {
      setIsProcessing(false);
      setShowScanner(false);
    }
  }, [onProductRegistered]);

  const handleCloseScanner = useCallback(() => {
    setShowScanner(false);
    setError('');
  }, []);

  const fetchProductDetails = async (barcode) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          nombre: `Producto ${barcode}`,
          cantidad: 1,
          precioUnitario: 0,
          proveedor: ''
        });
      }, 1000);
    });
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h4>Registro Automático por Código de Barras</h4>
      </Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-center align-items-center flex-column">
          <Button 
            variant="primary" 
            size="lg" 
            onClick={() => setShowScanner(true)}
            className="scanner-btn"
            disabled={isProcessing}
          >
            <i className="bi bi-camera"></i> Escanear Código de Barras
          </Button>

          {error && (
            <Alert 
              variant="danger" 
              className="scanner-alert mt-3" 
              onClose={() => setError('')} 
              dismissible
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert 
              variant="success" 
              className="scanner-alert mt-3" 
              onClose={() => setSuccess('')} 
              dismissible
            >
              {success}
            </Alert>
          )}
        </div>

        <BarcodeScanner
          show={showScanner}
          onClose={handleCloseScanner}
          onScan={handleBarcodeScan}
        />
      </Card.Body>
    </Card>
  );
};

export default AutomaticRegistration;