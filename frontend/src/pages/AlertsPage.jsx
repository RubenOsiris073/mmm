import React, { useState } from 'react';
import { Nav, Tab, Button } from 'react-bootstrap';
import { FaBell, FaExclamationTriangle, FaServer, FaClock, FaWifi, FaTerminal } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ExpirationAlerts from '../components/alerts/ExpirationAlerts';
import SystemNotifications from '../components/alerts/SystemNotifications';
import BackendLogs from '../components/alerts/BackendLogs';
import useBackendHealth from '../hooks/useBackendHealth';
import '../components/alerts/AlertsPageStyles.css';

const AlertsPage = () => {
  const [activeTab, setActiveTab] = useState('expiration');
  const navigate = useNavigate();
  const { isOnline, lastChecked, error, checkNow } = useBackendHealth(5000);

  return (
    <div className="alerts-main-container">
      <div className="alerts-content-wrapper">
        {/* Header Moderno con Estadísticas */}
        <div className="alerts-header">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h1 className="alerts-title">
                <FaBell className="me-3" />
                Centro de Alertas
              </h1>
              <p className="alerts-subtitle">
                Monitoreo en tiempo real del sistema y productos
              </p>
            </div>
          </div>
          
          {/* Grid de Estadísticas Principales en el Header */}
          <div className="stats-grid">
            <div className={`stat-card critical`}>
              <div className={`stat-icon critical`}>
                <FaExclamationTriangle />
              </div>
              <div className="stat-value">3</div>
              <div className="stat-label">Productos Críticos</div>
              <small className="text-muted">Caducan en 1 día o menos</small>
            </div>
            
            <div className={`stat-card warning`}>
              <div className={`stat-icon warning`}>
                <FaClock />
              </div>
              <div className="stat-value">12</div>
              <div className="stat-label">Próximos</div>
              <small className="text-muted">Caducan en 2-7 días</small>
            </div>
            
            <div className={`stat-card ${isOnline ? 'online' : 'offline'}`}>
              <div className={`stat-icon ${isOnline ? 'online' : 'offline'}`}>
                <FaServer />
              </div>
              <div className="stat-value">{isOnline ? 'En línea' : 'Desconectado'}</div>
              <div className="stat-label">
                Backend API
                {lastChecked && (
                  <div className="stat-time">
                    {lastChecked.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
            
            <div className={`stat-card info`}>
              <div className={`stat-icon info`}>
                <FaWifi />
              </div>
              <div className="stat-value">Online</div>
              <div className="stat-label">Conectividad</div>
              <small className="text-muted">Red estable</small>
            </div>
          </div>
        </div>

        {/* Alerta de Desconexión */}
        {!isOnline && (
          <div className="connection-alert position-relative">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <strong>⚠️ Backend Desconectado</strong>
                <div className="mt-1" style={{ color: '#6c757d' }}>
                  {error || 'No se puede conectar al servidor backend'}
                </div>
              </div>
              <Button 
                variant="outline-danger" 
                size="sm" 
                onClick={checkNow}
                style={{ borderRadius: '8px' }}
              >
                Verificar ahora
              </Button>
            </div>
          </div>
        )}

        {/* Tabs Navigation Mejorada */}
        <div className="alerts-tabs-container">
          <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
            <Nav className="alerts-nav-tabs">
              <Nav.Item>
                <Nav.Link eventKey="expiration" className="d-flex align-items-center">
                  <FaExclamationTriangle className="me-2" />
                  <div>
                    <div className="tab-title">Caducidad de Productos</div>
                    <small className="tab-subtitle">Monitoreo de fechas de vencimiento</small>
                  </div>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="system" className="d-flex align-items-center">
                  <FaServer className="me-2" />
                  <div>
                    <div className="tab-title">Estado del Sistema</div>
                    <small className="tab-subtitle">Notificaciones y avisos administrativos</small>
                  </div>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="logs" className="d-flex align-items-center">
                  <FaTerminal className="me-2" />
                  <div>
                    <div className="tab-title">Registros del Backend</div>
                    <small className="tab-subtitle">Monitoreo de actividad y errores</small>
                  </div>
                </Nav.Link>
              </Nav.Item>
            </Nav>

            {/* Tab Content */}
            <Tab.Content>
              <Tab.Pane eventKey="expiration">
                <div className="tab-content-wrapper">
                  <ExpirationAlerts />
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey="system">
                <div className="tab-content-wrapper">
                  <SystemNotifications backendStatus={{ isOnline, lastChecked, error }} />
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey="logs">
                <div className="tab-content-wrapper">
                  <BackendLogs />
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;