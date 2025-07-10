import React from 'react';
import { Card, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { 
  FaHeartbeat, 
  FaServer, 
  FaDatabase, 
  FaCloud, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationTriangle 
} from 'react-icons/fa';

/**
 * Componente que muestra el estado de los servicios del sistema
 */
const StatusCard = ({ systemStatus }) => {
  // Obtener icono según estado
  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <FaCheckCircle className="text-success" />;
      case 'offline': return <FaTimesCircle className="text-danger" />;
      case 'checking': return <Spinner animation="border" size="sm" />;
      default: return <FaExclamationTriangle className="text-warning" />;
    }
  };

  // Obtener texto del estado
  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'En línea';
      case 'offline': return 'Desconectado';
      case 'checking': return 'Verificando...';
      default: return 'Desconocido';
    }
  };

  // Obtener variante de color para el badge
  const getStatusVariant = (status) => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'danger';
      case 'checking': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <Card className="mb-4 system-status-card">
      <Card.Header className="bg-dark text-white">
        <h5 className="mb-0">
          <FaHeartbeat className="me-2" />
          Estado del Sistema
          {systemStatus.lastCheck && (
            <small className="float-end">
              Última verificación: {systemStatus.lastCheck.toLocaleTimeString('es-MX')}
            </small>
          )}
        </h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={4}>
            <div className="status-item">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <FaServer className="me-2 text-primary" size={20} />
                  <span className="fw-bold">Backend API</span>
                </div>
                <div className="d-flex align-items-center">
                  {getStatusIcon(systemStatus.backend)}
                  <Badge bg={getStatusVariant(systemStatus.backend)} className="ms-2">
                    {getStatusText(systemStatus.backend)}
                  </Badge>
                </div>
              </div>
            </div>
          </Col>
          <Col md={4}>
            <div className="status-item">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <FaDatabase className="me-2 text-primary" size={20} />
                  <span className="fw-bold">Base de Datos</span>
                </div>
                <div className="d-flex align-items-center">
                  {getStatusIcon(systemStatus.database)}
                  <Badge bg={getStatusVariant(systemStatus.database)} className="ms-2">
                    {getStatusText(systemStatus.database)}
                  </Badge>
                </div>
              </div>
            </div>
          </Col>
          <Col md={4}>
            <div className="status-item">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <FaCloud className="me-2 text-primary" size={20} />
                  <span className="fw-bold">Google Sheets</span>
                </div>
                <div className="d-flex align-items-center">
                  {getStatusIcon(systemStatus.sheets)}
                  <Badge bg={getStatusVariant(systemStatus.sheets)} className="ms-2">
                    {getStatusText(systemStatus.sheets)}
                  </Badge>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default StatusCard;
