import React, { useState, useEffect, useCallback } from 'react';
import { Card, Alert, Button, Form, InputGroup, Row, Col, Badge } from 'react-bootstrap';
import { FaQrcode, FaCopy, FaCheck } from 'react-icons/fa';
import QRCode from 'qrcode';
import './styles/SimpleQRPayment.css';

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
          <Card className="qr-payment-card">
            <Card.Header className="qr-payment-header">
              <h5 className="qr-payment-title">
                <FaQrcode className="me-2" />
                Código QR para Pago
              </h5>
            </Card.Header>
            <Card.Body className="qr-payment-body">
              {qrCodeUrl && (
                <div className="mb-3">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR para pago SPEI" 
                    className="qr-code-image"
                  />
                </div>
              )}
              
              <Badge className="qr-amount-badge">
                Monto: ${amount.toFixed(2)} MXN
              </Badge>
              
              <p className="qr-instructions-text">
                El cliente escanea este QR desde su app bancaria
              </p>

              <Alert className="qr-instructions-alert">
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
          <Card className="manual-transfer-card">
            <Card.Header className="manual-transfer-header">
              <h5 className="manual-transfer-title">Datos para Transferencia Manual</h5>
            </Card.Header>
            <Card.Body className="manual-transfer-body">
              <div className="mb-3">
                <strong>CLABE:</strong>
                <InputGroup className="mt-1">
                  <Form.Control 
                    value={paymentData.clabe} 
                    readOnly 
                    className="clabe-input"
                  />
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => copyToClipboard(paymentData.clabe)}
                    className="copy-btn"
                  >
                    {copied ? <FaCheck /> : <FaCopy />}
                  </Button>
                </InputGroup>
              </div>

              <div className="transfer-details">
                <div className="detail-line">
                  <strong>Banco:</strong> {paymentData.bank}
                </div>
                <div className="detail-line">
                  <strong>Titular:</strong> {paymentData.account}
                </div>
                <div className="detail-line">
                  <strong>Monto:</strong> <span className="amount-highlight">${amount.toFixed(2)}</span>
                </div>
                <div className="detail-line">
                  <strong>Concepto:</strong> {paymentData.concept}
                </div>
                <div className="detail-line">
                  <strong>Referencia:</strong> {paymentData.reference}
                </div>
              </div>

              <Alert className="payment-warning">
                <small>
                  <strong>⚠️ Importante:</strong> Una vez que recibas el pago en tu cuenta, 
                  confirma manualmente para completar la venta.
                </small>
              </Alert>

              <div className="d-grid gap-2">
                <Button 
                  className={`confirm-payment-btn ${manualConfirmation ? 'confirmed' : ''}`}
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
                  className="copy-all-btn"
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

      <Alert className="qr-advantages-alert">
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