import React, { useState } from 'react';
import { Card, Alert, Button, Row, Col } from 'react-bootstrap';
import { FaExternalLinkAlt, FaChartBar, FaInfoCircle } from 'react-icons/fa';

const GoogleStudioDashboard = ({ 
  dashboardUrl, 
  title = "Dashboard", 
  height = "600px",
  allowFullscreen = true 
}) => {
  const [showInfo, setShowInfo] = useState(false);

  // Función para abrir el dashboard en nueva pestaña
  const openInNewTab = () => {
    if (dashboardUrl && !dashboardUrl.includes('TU-DASHBOARD-ID')) {
      window.open(dashboardUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Función para extraer el ID del dashboard y crear enlace directo
  const getDirectUrl = (url) => {
    if (!url || url.includes('TU-DASHBOARD-ID')) return null;
    
    // Si es una URL corta, usarla directamente
    if (url.includes('lookerstudio.google.com/s/')) {
      return url;
    }
    
    // Si es una URL larga, intentar extraer el ID
    try {
      const match = url.match(/\/reporting\/([^/]+)/);
      if (match) {
        return `https://lookerstudio.google.com/reporting/${match[1]}`;
      }
    } catch (err) {
      console.error('Error al procesar URL:', err);
    }
    
    return url;
  };

  const directUrl = getDirectUrl(dashboardUrl);

  if (!dashboardUrl || dashboardUrl.includes('TU-DASHBOARD-ID')) {
    return (
      <Alert variant="info">
        <Alert.Heading><FaInfoCircle className="me-2" />Configuración necesaria</Alert.Heading>
        <p>Para mostrar tu dashboard de Looker Studio, necesitas configurar la URL del dashboard.</p>
        <Button 
          variant="outline-primary" 
          onClick={() => setShowInfo(!showInfo)}
        >
          {showInfo ? 'Ocultar' : 'Ver'} instrucciones
        </Button>
        
        {showInfo && (
          <div className="mt-3 p-3 bg-light rounded">
            <h6>Pasos para configurar:</h6>
            <ol>
              <li>Ve a tu dashboard en Looker Studio</li>
              <li>Clic en "Compartir" → "Obtener enlace"</li>
              <li>Copia la URL (puede ser larga o corta)</li>
              <li>Edita <code>DashboardPage.jsx</code> y reemplaza la URL</li>
            </ol>
          </div>
        )}
      </Alert>
    );
  }

  return (
    <Card className="shadow-sm">
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
        <div className="d-flex align-items-center">
          <FaChartBar className="me-2" />
          <h5 className="mb-0">{title}</h5>
        </div>
        <Button 
          variant="primary" 
          size="sm"
          onClick={openInNewTab}
          className="px-3 py-2"
          title="Abrir dashboard en nueva pestaña"
        >
          <FaExternalLinkAlt size="12" className="me-1" />
          Abrir
        </Button>
      </div>
      <Card.Body>
        

        <Row>
          <Col md={6}>
            <div className="p-3 border rounded bg-light">
              <h6><FaChartBar className="me-2" />Características del Dashboard</h6>
              <ul className="mb-0">
                <li>Métricas en tiempo real</li>
                <li>Gráficos interactivos</li>
                <li>Filtros personalizables</li>
                <li>Exportación de datos</li>
              </ul>
            </div>
          </Col>
          <Col md={6}>
            <div className="p-3 border rounded bg-light">
              <h6><FaInfoCircle className="me-2" />Acceso Rápido</h6>
              <p className="mb-2">
                El dashboard se abrirá en una nueva pestaña con acceso completo 
                a todas las funcionalidades de Looker Studio.
              </p>
              <small className="text-muted">
                URL: {directUrl ? directUrl.substring(0, 50) + '...' : 'No configurada'}
              </small>
            </div>
          </Col>
        </Row>

        {/* Vista previa alternativa - puedes agregar aquí gráficos locales */}
        <div className="mt-4">
          <h6>Vista Previa de Métricas</h6>
          <div className="row">
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h4 className="text-primary">124</h4>
                  <small className="text-muted">Ventas del Mes</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h4 className="text-success">$45,230</h4>
                  <small className="text-muted">Ingresos</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h4 className="text-warning">67</h4>
                  <small className="text-muted">Productos</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h4 className="text-info">89%</h4>
                  <small className="text-muted">Satisfacción</small>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-3">
            <small className="text-muted">
              Los datos mostrados son de ejemplo. Para ver métricas reales, haz clic en "Ver Dashboard en Looker Studio"
            </small>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default GoogleStudioDashboard;