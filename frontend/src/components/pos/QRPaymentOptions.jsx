import React, { useState } from 'react';
import { Card, Alert, Button, Badge, Row, Col } from 'react-bootstrap';
import { FaInfoCircle, FaCheckCircle, FaTimes, FaClock } from 'react-icons/fa';

const QRPaymentOptions = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  const paymentOptions = [
    {
      id: 'codi-oficial',
      name: 'CoDi Oficial (Banxico)',
      difficulty: 'Difícil',
      time: '2-4 semanas',
      cost: 'Gratis (sin comisiones)',
      requirements: [
        'Registro como comercio en Banxico',
        'Cuenta empresarial en banco participante',
        'CLABE comercial certificada',
        'Integración con API oficial de CoDi',
        'Webhook para confirmaciones'
      ],
      pros: [
        'Sin comisiones',
        'Transferencias instantáneas 24/7',
        'Respaldado por gobierno mexicano',
        'Aceptado por todos los bancos'
      ],
      cons: [
        'Proceso de registro largo',
        'Requiere documentación empresarial',
        'Integración técnica compleja'
      ],
      status: 'recommended'
    },
    {
      id: 'mercadopago',
      name: 'Mercado Pago QR',
      difficulty: 'Fácil',
      time: '1-2 días',
      cost: '3.5% + IVA por transacción',
      requirements: [
        'Cuenta de Mercado Pago',
        'RFC (puede ser persona física)',
        'Cuenta bancaria para retiros',
        'Integración con API de Mercado Pago'
      ],
      pros: [
        'Registro muy rápido',
        'API muy fácil de usar',
        'QR dinámico automático',
        'Dashboard completo incluido',
        'Soporte técnico'
      ],
      cons: [
        'Comisiones por transacción',
        'Depende de empresa privada',
        'Retiros cada 24-48 horas'
      ],
      status: 'easy'
    },
    {
      id: 'clip',
      name: 'Clip QR',
      difficulty: 'Fácil',
      time: '1-3 días',
      cost: '3.6% por transacción',
      requirements: [
        'Cuenta Clip',
        'RFC',
        'Identificación oficial',
        'Comprobante de domicilio'
      ],
      pros: [
        'Muy popular en México',
        'Registro sencillo',
        'También acepta tarjetas físicas',
        'App móvil completa'
      ],
      cons: [
        'Comisiones',
        'Menor flexibilidad técnica',
        'Enfocado más a comercio físico'
      ],
      status: 'alternative'
    },
    {
      id: 'spei-manual',
      name: 'SPEI Manual (Simulado)',
      difficulty: 'Muy Fácil',
      time: 'Inmediato',
      cost: 'Gratis',
      requirements: [
        'Solo tu CLABE personal',
        'Validación manual de pagos',
        'Sistema de confirmación manual'
      ],
      pros: [
        'Implementación inmediata',
        'Sin registro comercial',
        'Sin comisiones',
        'Funciona con cualquier banco'
      ],
      cons: [
        'Validación manual requerida',
        'No hay confirmación automática',
        'Más trabajo operativo',
        'Menos profesional'
      ],
      status: 'manual'
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'recommended':
        return <Badge bg="success"><FaCheckCircle className="me-1" />Recomendado</Badge>;
      case 'easy':
        return <Badge bg="primary"><FaCheckCircle className="me-1" />Más Fácil</Badge>;
      case 'alternative':
        return <Badge bg="warning"><FaInfoCircle className="me-1" />Alternativa</Badge>;
      case 'manual':
        return <Badge bg="secondary"><FaClock className="me-1" />Manual</Badge>;
      default:
        return null;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Muy Fácil': return 'success';
      case 'Fácil': return 'primary';
      case 'Difícil': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <div className="qr-payment-options">
      <Alert variant="info" className="mb-4">
        <FaInfoCircle className="me-2" />
        <strong>¿Cómo hacer que el QR realmente cobre?</strong><br />
        Necesitas darte de alta con un proveedor de pagos. Aquí tienes las opciones reales:
      </Alert>

      <Row>
        {paymentOptions.map((option) => (
          <Col md={6} lg={3} key={option.id} className="mb-4">
            <Card 
              className={`h-100 ${selectedOption === option.id ? 'border-primary' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedOption(selectedOption === option.id ? null : option.id)}
            >
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">{option.name}</h6>
                {getStatusBadge(option.status)}
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <Badge bg={getDifficultyColor(option.difficulty)} className="me-2">
                    {option.difficulty}
                  </Badge>
                  <small className="text-muted">{option.time}</small>
                </div>

                <div className="mb-3">
                  <strong className="text-success">Costo:</strong><br />
                  <small>{option.cost}</small>
                </div>

                {selectedOption === option.id && (
                  <>
                    <div className="mb-3">
                      <strong>Requisitos:</strong>
                      <ul className="small mt-1 mb-2">
                        {option.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-3">
                      <strong className="text-success">Ventajas:</strong>
                      <ul className="small text-success mt-1 mb-2">
                        {option.pros.map((pro, index) => (
                          <li key={index}>{pro}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-3">
                      <strong className="text-danger">Desventajas:</strong>
                      <ul className="small text-danger mt-1">
                        {option.cons.map((con, index) => (
                          <li key={index}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {selectedOption && (
        <Alert variant="warning" className="mt-4">
          <h6>
            <FaInfoCircle className="me-2" />
            Siguiente paso para {paymentOptions.find(o => o.id === selectedOption)?.name}:
          </h6>
          {selectedOption === 'mercadopago' && (
            <div>
              <p>1. Ve a <a href="https://www.mercadopago.com.mx/developers" target="_blank" rel="noopener noreferrer">mercadopago.com.mx/developers</a></p>
              <p>2. Crea una cuenta de desarrollador</p>
              <p>3. Obtén tus credenciales de API (Access Token)</p>
              <p>4. Te ayudo a implementar la integración en tu sistema</p>
            </div>
          )}
          {selectedOption === 'codi-oficial' && (
            <div>
              <p>1. Contacta a tu banco para registro CoDi comercial</p>
              <p>2. Solicita documentación requerida</p>
              <p>3. Una vez registrado, obtén credenciales API</p>
              <p>4. Implementamos la integración oficial</p>
            </div>
          )}
          {selectedOption === 'clip' && (
            <div>
              <p>1. Ve a <a href="https://clip.mx" target="_blank" rel="noopener noreferrer">clip.mx</a></p>
              <p>2. Regístrate como comercio</p>
              <p>3. Verifica tu cuenta</p>
              <p>4. Obtén credenciales para API</p>
            </div>
          )}
          {selectedOption === 'spei-manual' && (
            <div>
              <p>1. Solo necesitas tu CLABE personal/empresarial</p>
              <p>2. Te implemento el QR que muestre tus datos bancarios</p>
              <p>3. El cliente hace transferencia manual</p>
              <p>4. Tú confirmas el pago cuando veas que llegó</p>
              <p><strong>⚠️ No es automático, pero funciona inmediatamente</strong></p>
            </div>
          )}
        </Alert>
      )}

      <Alert variant="success" className="mt-4">
        <h6>🚀 Mi Recomendación:</h6>
        <p className="mb-2">
          <strong>Para empezar rápido:</strong> Mercado Pago (1-2 días implementando)
        </p>
        <p className="mb-0">
          <strong>Para el futuro:</strong> CoDi oficial (sin comisiones, pero más tardado)
        </p>
      </Alert>
    </div>
  );
};

export default QRPaymentOptions;