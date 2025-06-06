import React, { useEffect, useState, useCallback } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import QRCode from 'qrcode';

const QRCodeGenerator = ({ data, type, amount }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const generateQRCode = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let qrString = '';

      switch (type) {
        case 'codi':
          // Formato CoDi según estándar de Banxico
          qrString = generateCodiQR(data);
          break;
        case 'mercadopago':
          // Formato Mercado Pago (simulado - en producción usarías su API)
          qrString = generateMercadoPagoQR(data);
          break;
        case 'spei':
          // Formato SPEI QR
          qrString = generateSpeiQR(data);
          break;
        default:
          throw new Error('Tipo de QR no soportado');
      }

      // Generar el código QR
      const qrOptions = {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      };

      const qrUrl = await QRCode.toDataURL(qrString, qrOptions);
      setQrCodeUrl(qrUrl);
    } catch (err) {
      console.error('Error generando QR:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [data, type]);

  useEffect(() => {
    generateQRCode();
  }, [generateQRCode]);

  // Generar QR en formato CoDi (Banxico)
  const generateCodiQR = (data) => {
    // Formato estándar CoDi según Banxico
    // Este es un formato simplificado, en producción necesitarías la API oficial
    const codiData = {
      version: '01',
      merchantAccountInfo: data.merchantId || '123456789',
      merchantName: data.merchantName || 'Comercio',
      amount: parseFloat(data.amount).toFixed(2),
      currency: '484', // Código ISO para MXN
      concept: data.concept || 'Compra',
      reference: data.reference || `REF${Date.now()}`
    };

    // En producción, aquí usarías el formato oficial de CoDi
    return JSON.stringify(codiData);
  };

  // Generar QR para Mercado Pago (simulado)
  const generateMercadoPagoQR = (data) => {
    // En producción, usarías la API de Mercado Pago para generar QR dinámicos
    const mpData = {
      collector_id: '123456789', // ID del vendedor
      amount: parseFloat(data.amount).toFixed(2),
      description: data.concept || 'Compra POS',
      external_reference: data.reference || `MP${Date.now()}`,
      notification_url: 'https://tu-servidor.com/webhook'
    };

    return JSON.stringify(mpData);
  };

  // Generar QR para SPEI
  const generateSpeiQR = (data) => {
    const speiData = {
      clabe: data.merchantId || '012345678901234567', // CLABE del comercio
      amount: parseFloat(data.amount).toFixed(2),
      concept: data.concept || 'Pago',
      reference: data.reference || `SPEI${Date.now()}`
    };

    return JSON.stringify(speiData);
  };

  const getQRTitle = () => {
    switch (type) {
      case 'codi':
        return 'Código CoDi - Banxico';
      case 'mercadopago':
        return 'Código Mercado Pago';
      case 'spei':
        return 'Código SPEI';
      default:
        return 'Código QR';
    }
  };

  const getInstructions = () => {
    switch (type) {
      case 'codi':
        return [
          'Abre tu app bancaria preferida',
          'Busca la opción "CoDi" o "Pagar con QR"',
          'Escanea este código',
          'Confirma el pago de $' + amount.toFixed(2)
        ];
      case 'mercadopago':
        return [
          'Abre la app de Mercado Pago',
          'Toca "Pagar con QR"',
          'Escanea este código',
          'Confirma el pago'
        ];
      case 'spei':
        return [
          'Abre tu app bancaria',
          'Busca "Transferencias SPEI"',
          'Selecciona "Pagar con QR"',
          'Escanea y confirma'
        ];
      default:
        return ['Escanea el código QR', 'Confirma el pago'];
    }
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Generando código QR...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error al generar QR</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  return (
    <div className="qr-payment-container">
      <div className="text-center mb-3">
        <h6 className="text-primary">{getQRTitle()}</h6>
        <p className="text-muted mb-2">Monto: <strong>${amount.toFixed(2)} MXN</strong></p>
      </div>

      {qrCodeUrl && (
        <div className="text-center mb-3">
          <img 
            src={qrCodeUrl} 
            alt="Código QR para pago" 
            className="img-fluid"
            style={{ 
              maxWidth: '250px', 
              border: '2px solid #dee2e6',
              borderRadius: '8px',
              padding: '10px',
              backgroundColor: 'white'
            }}
          />
        </div>
      )}

      <div className="qr-instructions">
        <h6 className="text-success mb-2">
          <i className="bi bi-check-circle me-2"></i>
          Instrucciones:
        </h6>
        <ol className="mb-0">
          {getInstructions().map((instruction, index) => (
            <li key={index} className="mb-1">
              <small>{instruction}</small>
            </li>
          ))}
        </ol>
      </div>

      {type === 'codi' && (
        <Alert variant="success" className="mt-3 mb-0">
          <small>
            <i className="bi bi-shield-check me-1"></i>
            <strong>CoDi es seguro:</strong> Sin comisiones, transferencia instantánea y respaldado por Banxico.
          </small>
        </Alert>
      )}

      {type === 'mercadopago' && (
        <Alert variant="info" className="mt-3 mb-0">
          <small>
            <i className="bi bi-info-circle me-1"></i>
            <strong>Nota:</strong> Se aplicará una comisión del 3.5% sobre el monto total.
          </small>
        </Alert>
      )}
    </div>
  );
};

export default QRCodeGenerator;