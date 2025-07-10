import React from 'react';
import { Card, Row, Col, Alert } from 'react-bootstrap';
import { FaBell, FaExclamationTriangle } from 'react-icons/fa';

/**
 * Componente que muestra un resumen de notificaciones críticas y no leídas
 */
const NotificationsSummary = ({ notifications }) => {
  const unreadNotifications = notifications.filter(n => !n.read);
  const criticalNotifications = notifications.filter(n => n.priority === 'critical');

  return (
    <>
      {/* Alertas Críticas */}
      {criticalNotifications.length > 0 && (
        <Alert variant="danger" className="mb-4">
          <FaExclamationTriangle className="me-2" />
          <strong>¡Atención!</strong> Tienes {criticalNotifications.length} notificación(es) crítica(s) que requieren atención inmediata.
        </Alert>
      )}

      {/* Resumen de Notificaciones */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="h-100 border-primary">
            <Card.Body className="text-center">
              <FaBell className="text-primary mb-2" size={32} />
              <h3 className="text-primary mb-1">{unreadNotifications.length}</h3>
              <small className="text-muted">Notificaciones sin leer</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100 border-danger">
            <Card.Body className="text-center">
              <FaExclamationTriangle className="text-danger mb-2" size={32} />
              <h3 className="text-danger mb-1">{criticalNotifications.length}</h3>
              <small className="text-muted">Notificaciones críticas</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default NotificationsSummary;
