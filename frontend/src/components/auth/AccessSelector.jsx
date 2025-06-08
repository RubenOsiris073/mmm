import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaMoneyBillWave, FaCog, FaArrowRight } from 'react-icons/fa';

const AccessSelector = ({ onSelectAccess }) => {
  const accessOptions = [
    {
      id: 'pos',
      title: 'Punto de Venta',
      subtitle: 'Sistema de ventas y cobros',
      description: 'Acceso para operadores de caja y personal de ventas',
      icon: <FaMoneyBillWave size={48} className="text-primary" />,
      variant: 'primary',
      features: [
        'Procesar ventas',
        'Gestionar pagos',
        'Imprimir tickets',
        'Consultar productos'
      ]
    },
    {
      id: 'admin',
      title: 'Administración',
      subtitle: 'Panel de control completo',
      description: 'Acceso completo para administradores del sistema',
      icon: <FaCog size={48} className="text-danger" />,
      variant: 'danger',
      features: [
        'Gestionar productos',
        'Ver reportes de ventas',
        'Controlar inventario',
        'Configurar sistema'
      ]
    }
  ];

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center" style={{ 
      backgroundColor: 'var(--bg-primary)', 
      color: 'var(--text-primary)' 
    }}>
      <div className="w-100" style={{ maxWidth: '1000px' }}>
        {/* Header */}
        <div className="text-center mb-5">
          <h2 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Selecciona tu tipo de acceso
          </h2>
          <p className="lead" style={{ color: 'var(--text-secondary)' }}>
            Elige la opción que corresponde a tu rol en el sistema
          </p>
        </div>

        {/* Access Options */}
        <Row className="g-4 justify-content-center">
          {accessOptions.map((option) => (
            <Col key={option.id} xs={12} md={6} lg={5}>
              <Card 
                className="h-100 shadow-lg border-0 position-relative overflow-hidden access-card"
                style={{ 
                  backgroundColor: 'var(--card-bg)', 
                  borderColor: 'var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => onSelectAccess(option.id)}
              >
                <Card.Body className="p-4 text-center">
                  {/* Icon */}
                  <div className="mb-4">
                    {option.icon}
                  </div>

                  {/* Title and Subtitle */}
                  <h4 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {option.title}
                  </h4>
                  <h6 className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {option.subtitle}
                  </h6>

                  {/* Description */}
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {option.description}
                  </p>

                  {/* Features List */}
                  <ul className="list-unstyled mb-4">
                    {option.features.map((feature, index) => (
                      <li key={index} className="mb-2 d-flex align-items-center justify-content-center">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        <small style={{ color: 'var(--text-secondary)' }}>{feature}</small>
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  <Button
                    variant={option.variant}
                    size="lg"
                    className="w-100 fw-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAccess(option.id);
                    }}
                  >
                    Acceder como {option.title}
                    <FaArrowRight className="ms-2" />
                  </Button>
                </Card.Body>

                {/* Hover Effect Overlay */}
                <div 
                  className="position-absolute top-0 start-0 w-100 h-100"
                  style={{
                    background: `linear-gradient(135deg, ${option.variant === 'primary' ? 'rgba(13, 110, 253, 0.1)' : 'rgba(220, 53, 69, 0.1)'} 0%, transparent 100%)`,
                    opacity: 0,
                    transition: 'opacity 0.3s ease'
                  }}
                ></div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Footer Info */}
        <div className="text-center mt-5">
          <small style={{ color: 'var(--text-secondary)' }}>
            <i className="bi bi-info-circle me-2"></i>
            Si no tienes acceso a ninguna de estas opciones, contacta al administrador del sistema
          </small>
        </div>
      </div>

      <style jsx>{`
        .access-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
        }
        .access-card:hover .position-absolute {
          opacity: 1 !important;
        }
      `}</style>
    </Container>
  );
};

export default AccessSelector;