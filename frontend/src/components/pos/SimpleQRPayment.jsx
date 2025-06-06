import React, { useState, useEffect, useCallback } from 'react';
import { Card, Alert, Button, Form, InputGroup, Row, Col, Badge } from 'react-bootstrap';
import { FaQrcode, FaCopy, FaCheck, FaInfoCircle } from 'react-icons/fa';
import QRCode from 'qrcode';

const SimpleQRPayment = ({ amount, concept = "Compra POS", onPaymentConfirmed }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [manualConfirmation, setManualConfirmation] = useState(false);
  const [paymentData, setPaymentData] = useState({
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

  const updatePaymentData = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="simple-qr-payment">
      {/* Configuración rápida */}
      <Card className="mb-3">
        <Card.Header className="bg-info text-white">
          <h6 className="mb-0">
            <FaInfoCircle className="me-2" />
            Configuración de tu cuenta (hazlo una vez)
          </h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>Tu CLABE bancaria:</Form.Label>
                <Form.Control
                  type="text"
                  value={paymentData.clabe}
                  onChange={(e) => updatePaymentData('clabe', e.target.value)}
                  placeholder="18 dígitos de tu CLABE"
                  maxLength={18}
                />
                <Form.Text className="text-muted">
                  La encuentras en tu app bancaria o estado de cuenta
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-2">
                <Form.Label>Banco:</Form.Label>
                <Form.Control
                  type="text"
                  value={paymentData.bank}
                  onChange={(e) => updatePaymentData('bank', e.target.value)}
                  placeholder="Nombre del banco"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-2">
                <Form.Label>Titular:</Form.Label>
                <Form.Control
                  type="text"
                  value={paymentData.account}
                  onChange={(e) => updatePaymentData('account', e.target.value)}
                  placeholder="Tu nombre/negocio"
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

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

      <Alert variant="info" className="mt-2">
        <h6>Para mejorarlo después:</h6>
        <p className="mb-0">
          Más adelante puedes integrar <strong>Mercado Pago</strong> o <strong>CoDi oficial</strong> 
          para confirmación automática de pagos.
        </p>
      </Alert>
    </div>
  );
};

export default SimpleQRPayment;