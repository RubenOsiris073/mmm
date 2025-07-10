import React, { useState } from 'react';
import { Nav, Tab, Button } from 'react-bootstrap';
import { FaBell, FaExclamationTriangle, FaServer, FaClock, FaWifi, FaTerminal } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Estilos
import '../styles/pages/alerts.css';
import '../styles/pages/alerts-override.css'; // Asegurar aplicación del fondo azul

// Componentes
import ExpirationAlerts from '../components/alerts/ExpirationAlerts';
import SystemNotifications from '../components/alerts/SystemNotifications';
import BackendLogs from '../components/alerts/BackendLogs';

// Hooks
import useBackendHealth from '../hooks/useBackendHealth';

/**
 * Página principal del Centro de Alertas
 * Muestra diferentes tipos de alertas organizadas en pestañas
 */
const AlertsPage = () => {
  // Estado y hooks
  const [activeTab, setActiveTab] = useState('expiration');
  const [checkStatus, setCheckStatus] = useState(null); // Para mensajes tras verificación manual
  const navigate = useNavigate();
  const { isOnline, lastChecked, error, errorType, isChecking, checkNow } = useBackendHealth(30000); // Intervalo más largo

  // Componentes de UI
  const renderHeader = () => (
    <div className="alerts-header">
      <div className="d-flex align-items-center justify-content-between">
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
      
      {renderStatsGrid()}
    </div>
  );

  const renderStatsGrid = () => (
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
      
      <div 
        className={`stat-card ${isChecking ? 'checking' : (isOnline ? 'online' : 'offline')}`}
        onClick={handleManualCheck}
        style={{ cursor: 'pointer' }}
        title="Haz clic para verificar la conexión"
      >
        <div className={`stat-icon ${isChecking ? 'checking' : (isOnline ? 'online' : 'offline')}`}>
          {isChecking ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          ) : (
            <FaServer />
          )}
        </div>
        <div className="stat-value">
          {isChecking ? (
            <span className="d-flex align-items-center">
              <span className="me-1">Verificando</span>
              <span className="checking-dots">...</span>
            </span>
          ) : (isOnline ? 'En línea' : 'Desconectado')}
        </div>
        <div className="stat-label">
          Backend API
          {lastChecked && (
            <div className="stat-time d-flex align-items-center justify-content-center">
              <small>{lastChecked.toLocaleTimeString()}</small>
              {!isChecking && (
                <span className="ms-2 refresh-icon" title="Verificar ahora">
                  ↻
                </span>
              )}
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
  );

  // Manejar verificación manual con feedback
  const handleManualCheck = async () => {
    setCheckStatus('checking');
    try {
      await checkNow();
      setCheckStatus(isOnline ? 'success' : 'error');
      
      // Limpiar estado después de 3 segundos
      setTimeout(() => {
        setCheckStatus(null);
      }, 3000);
    } catch (err) {
      setCheckStatus('error');
    }
  };

  // Renderizar la alerta de conexión si el backend está desconectado
  const renderConnectionAlert = () => {
    // Mostrar alerta si está desconectado o hay mensaje de verificación manual
    if (isOnline && !checkStatus) return null;
    
    // Generar mensaje basado en tipo de error para ayuda más específica
    const getErrorGuidance = () => {
      if (!error) return 'No se puede conectar al servidor backend';
      
      switch(errorType) {
        case 'cors':
          return 'Error CORS: El servidor rechaza conexiones. Revise la configuración de CORS en el backend.';
        case 'timeout':
          return 'El servidor no responde. Verifique que el backend esté funcionando y no bloqueado.';
        case 'connection':
          return 'No se puede establecer conexión. Revise que el servidor esté iniciado y accesible.';
        case 'http':
          return `Error HTTP ${error}. El servidor rechaza la petición.`;
        default:
          return error;
      }
    };
    
    const getAlertColor = () => {
      if (isChecking) return 'bg-secondary bg-opacity-10';
      if (isOnline && checkStatus === 'success') return 'bg-success bg-opacity-10 border-success';
      return 'bg-danger bg-opacity-10';
    };
    
    const getButtonStyle = () => {
      if (isChecking) return 'btn-secondary opacity-75';
      if (isOnline && checkStatus === 'success') return 'btn-outline-success';
      return 'btn-outline-danger';
    };
    
    // Si está en línea y tenemos un mensaje de éxito reciente, mostrar mensaje
    const showSuccessMessage = isOnline && checkStatus === 'success';
    
    return (
      <div className={`connection-alert position-relative ${getAlertColor()} p-3 rounded-3 mb-3`}>
        <div className="d-flex align-items-center justify-content-between">
          <div>
            {showSuccessMessage ? (
              <strong className="text-success">
                <i className="fas fa-check-circle me-2"></i>
                Conexión Restablecida
              </strong>
            ) : (
              <strong className={isChecking ? 'text-secondary' : 'text-danger'}>
                {isChecking ? 'Verificando Conexión...' : 'Backend Desconectado'}
              </strong>
            )}
            
            <div className="mt-1" style={{ color: '#6c757d' }}>
              {showSuccessMessage 
                ? 'El backend está funcionando correctamente' 
                : getErrorGuidance()
              }
            </div>
            
            {lastChecked && (
              <small className="text-muted d-block mt-1">
                Última verificación: {lastChecked.toLocaleTimeString()}
              </small>
            )}
          </div>
          
          <Button 
            variant={getButtonStyle()}
            size="sm" 
            onClick={handleManualCheck}
            className={`verify-button px-3 py-1 ${isChecking ? 'checking-button' : ''}`}
            style={{ 
              borderRadius: '8px', 
              minWidth: '120px',
              position: 'relative',
              transition: 'all 0.3s ease'
            }}
            title="Verificar conexión"
            disabled={isChecking}
          >
            {isChecking ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Verificando...
              </>
            ) : (showSuccessMessage ? (
              <>
                <i className="fas fa-check-circle me-2"></i>
                Conectado
              </>
            ) : 'Verificar')}
          </Button>
        </div>
      </div>
    );
  };

  const renderTabNavigation = () => (
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
  );

  const renderTabContent = () => (
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
  );

  // Renderizado principal
  return (
    <div className="alerts-main-container">
      <div className="alerts-content-wrapper">
        {renderHeader()}
        {renderConnectionAlert()}

        <div className="alerts-tabs-container">
          <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
            {renderTabNavigation()}
            {renderTabContent()}
          </Tab.Container>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;