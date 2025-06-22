import React, { useState, useEffect, useCallback } from 'react';
import { Card, Alert, Button, Form, InputGroup, Row, Col, Badge } from 'react-bootstrap';
import { FaQrcode, FaCopy, FaCheck } from 'react-icons/fa';
import QRCode from 'qrcode';

const SimpleQRPayment = ({ amount, concept = "Compra POS", onPaymentConfirmed }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [manualConfirmation, setManualConfirmation] = useState(false);
  const [paymentData] = useState({
    clabe: '012345678901234567', // Cambia por tu CLABE real
    bank: 'BBVA',
    account: 'Juan Pérez Negocio',
    amount: amount,
    concept: concept,
    reference: `REF${Date.now()}`
  });

  const generateQRCode = useCallback(async () => {
    try {
      // Crear string para QR (formato simple que bancos pueden leer)
      const qrString = `SPEI|${paymentData.clabe}|${amount.toFixed(2)}|${paymentData.concept}|${paymentData.reference}`;

      const qrOptions = {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        width: 300
      };

      const qrUrl = await QRCode.toDataURL(qrString, qrOptions);
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generando QR:', error);
    }
  }, [amount, paymentData]);

  useEffect(() => {
    if (amount > 0) {
      generateQRCode();
    }
  }, [amount, generateQRCode]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleManualConfirmation = () => {
    setManualConfirmation(true);
    if (onPaymentConfirmed) {
      onPaymentConfirmed({
        method: 'spei-qr',
        amount: amount,
        reference: paymentData.reference,
        manualConfirmation: true
      });
    }
  };

  return (
    <div className="simple-qr-payment">
      {/* QR Code y datos para pago */}
      <Row>
        <Col md={6}>
          <Card className="text-center">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <FaQrcode className="me-2" />
                Código QR para Pago
              </h5>
            </Card.Header>
            <Card.Body>
              {qrCodeUrl && (
                <div className="mb-3">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR para pago SPEI" 
                    className="img-fluid"
                    style={{ 
                      maxWidth: '280px',
                      border: '2px solid #dee2e6',
                      borderRadius: '10px',
                      padding: '15px',
                      backgroundColor: 'white'
                    }}
                  />
                </div>
              )}
              
              <Badge bg="success" className="mb-2">
                Monto: ${amount.toFixed(2)} MXN
              </Badge>
              
              <p className="text-muted mb-3">
                El cliente escanea este QR desde su app bancaria
              </p>

              <Alert variant="info" className="small">
                <strong>Instrucciones para el cliente:</strong><br/>
                1. Abre tu app bancaria<br/>
                2. Busca "Transferir" o "SPEI"<br/>
                3. Selecciona "Escanear QR" o "Pagar con QR"<br/>
                4. Escanea este código<br/>
                5. Confirma el pago
              </Alert>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header className="bg-secondary text-white">
              <h5 className="mb-0">Datos para Transferencia Manual</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>CLABE:</strong>
                <InputGroup className="mt-1">
                  <Form.Control 
                    value={paymentData.clabe} 
                    readOnly 
                    className="text-center fw-bold"
                  />
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => copyToClipboard(paymentData.clabe)}
                  >
                    {copied ? <FaCheck /> : <FaCopy />}
                  </Button>
                </InputGroup>
              </div>

              <div className="mb-3">
                <strong>Banco:</strong> {paymentData.bank}<br/>
                <strong>Titular:</strong> {paymentData.account}<br/>
                <strong>Monto:</strong> <span className="text-success fw-bold">${amount.toFixed(2)}</span><br/>
                <strong>Concepto:</strong> {paymentData.concept}<br/>
                <strong>Referencia:</strong> {paymentData.reference}
              </div>

              <Alert variant="warning" className="mb-3">
                <small>
                  <strong>⚠️ Importante:</strong> Una vez que recibas el pago en tu cuenta, 
                  confirma manualmente para completar la venta.
                </small>
              </Alert>

              <div className="d-grid gap-2">
                <Button 
                  variant="success" 
                  onClick={handleManualConfirmation}
                  disabled={manualConfirmation}
                >
                  {manualConfirmation ? (
                    <>
                      <FaCheck className="me-2" />
                      Pago Confirmado
                    </>
                  ) : (
                    'Confirmar que Recibí el Pago'
                  )}
                </Button>
                
                <Button 
                  variant="outline-info" 
                  size="sm"
                  onClick={() => copyToClipboard(
                    `CLABE: ${paymentData.clabe}\nMonto: $${amount.toFixed(2)}\nConcepto: ${paymentData.concept}\nReferencia: ${paymentData.reference}`
                  )}
                >
                  <FaCopy className="me-1" />
                  Copiar todos los datos
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Alert variant="success" className="mt-3">
        <h6>Ventajas de este método:</h6>
        <ul className="mb-0">
          <li><strong>Funciona inmediatamente</strong> - Sin registros ni trámites</li>
          <li><strong>Sin comisiones</strong> - Transferencias SPEI normales</li>
          <li><strong>Cualquier banco</strong> - Todos soportan SPEI</li>
          <li><strong>Seguro</strong> - Dinero directo a tu cuenta</li>
        </ul>
      </Alert>
    </div>
  );
};

export default SimpleQRPayment;