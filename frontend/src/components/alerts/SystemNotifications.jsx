import React, { useState, useEffect, useCallback } from 'react';
import { Card, Alert, Badge, Button, Row, Col, Toast, ToastContainer, Spinner } from 'react-bootstrap';
import { 
  FaServer, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaCog, 
  FaDatabase, 
  FaCloud, 
  FaBell,
  FaHeartbeat,
  FaTerminal,
  FaCode,
  FaTools
} from 'react-icons/fa';
import apiService from '../../services/apiService';
import './SystemNotifications.css';

const SystemNotifications = ({ backendStatus }) => {
  const [systemStatus, setSystemStatus] = useState({
    backend: backendStatus?.isOnline ? 'online' : 'offline',
    database: 'checking',
    sheets: 'checking',
    lastCheck: backendStatus?.lastChecked || null
  });
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Actualizar el estado del backend cuando cambie la prop
  useEffect(() => {
    if (backendStatus) {
      setSystemStatus(prev => ({
        ...prev,
        backend: backendStatus.isOnline ? 'online' : 'offline',
        lastCheck: backendStatus.lastChecked
      }));
    }
  }, [backendStatus]);

  const checkOtherServices = useCallback(async () => {
    try {
      const newStatus = {
        database: 'checking',
        sheets: 'checking',
        lastCheck: new Date()
      };

      // Verificar Base de datos (Firebase)
      try {
        const dbResponse = await apiService.getSalesDataFromSheets();
        newStatus.database = dbResponse.success ? 'online' : 'offline';
      } catch (error) {
        newStatus.database = 'offline';
      }

      // Verificar Google Sheets
      try {
        const sheetsResponse = await apiService.getSalesDataFromSheets();
        newStatus.sheets = sheetsResponse.success ? 'online' : 'offline';
      } catch (error) {
        newStatus.sheets = 'offline';
        showToast('warning', 'Google Sheets desconectado', 'Verificar configuración de API');
      }

      setSystemStatus(prev => ({
        ...prev,
        database: newStatus.database,
        sheets: newStatus.sheets,
        lastCheck: newStatus.lastCheck
      }));
    } catch (error) {
      console.error('Error checking other services:', error);
    }
  }, []);

  useEffect(() => {
    // Solo verificar database y sheets, el backend ya viene desde la prop
    checkOtherServices();
    loadNotifications();
    
    // Verificar otros servicios cada 30 segundos
    const statusInterval = setInterval(checkOtherServices, 30000);
    // Cargar notificaciones cada 5 minutos
    const notificationInterval = setInterval(loadNotifications, 5 * 60 * 1000);
    
    return () => {
      clearInterval(statusInterval);
      clearInterval(notificationInterval);
    };
  }, [checkOtherServices]);

  const loadNotifications = () => {
    // Simular notificaciones administrativas (en producción vendrían de una API)
    const adminNotifications = [
      {
        id: 1,
        type: 'info',
        title: 'Actualización de Sistema',
        message: 'Nueva versión v2.1.0 disponible con mejoras en el dashboard de ventas.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        priority: 'medium',
        category: 'system',
        read: false,
        actionUrl: '/updates'
      },
      {
        id: 2,
        type: 'warning',
        title: 'Mantenimiento Programado',
        message: 'El sistema estará en mantenimiento el 25 de junio de 2:00 AM a 4:00 AM.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hora atrás
        priority: 'high',
        category: 'maintenance',
        read: false,
        actionUrl: null
      },
      {
        id: 3,
        type: 'success',
        title: 'Backup Completado',
        message: 'Respaldo automático de datos completado exitosamente.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
        priority: 'low',
        category: 'backup',
        read: true,
        actionUrl: null
      },
      {
        id: 4,
        type: 'error',
        title: 'Error en Detección de Productos',
        message: 'El modelo de IA ha reportado errores intermitentes. Se recomienda reiniciar el servicio.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutos atrás
        priority: 'critical',
        category: 'ai',
        read: false,
        actionUrl: '/detection'
      },
      {
        id: 5,
        type: 'info',
        title: 'Nueva Funcionalidad',
        message: 'Se agregó el módulo de alertas de caducidad para mejor gestión del inventario.',
        timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutos atrás
        priority: 'medium',
        category: 'feature',
        read: false,
        actionUrl: '/alerts'
      }
    ];

    setNotifications(adminNotifications);
  };

  const showToast = (type, title, message) => {
    const newToast = {
      id: Date.now(),
      type,
      title,
      message,
      show: true
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== newToast.id));
    }, 5000);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <FaCheckCircle className="text-success" />;
      case 'offline': return <FaTimesCircle className="text-danger" />;
      case 'checking': return <Spinner animation="border" size="sm" />;
      default: return <FaExclamationTriangle className="text-warning" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'En línea';
      case 'offline': return 'Desconectado';
      case 'checking': return 'Verificando...';
      default: return 'Desconocido';
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'danger';
      case 'checking': return 'warning';
      default: return 'secondary';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <FaCheckCircle className="text-success" />;
      case 'error': return <FaTimesCircle className="text-danger" />;
      case 'warning': return <FaExclamationTriangle className="text-warning" />;
      case 'info': return <FaInfoCircle className="text-info" />;
      default: return <FaBell className="text-primary" />;
    }
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      critical: 'danger',
      high: 'warning',
      medium: 'info',
      low: 'secondary'
    };
    return <Badge bg={variants[priority]} pill>{priority.toUpperCase()}</Badge>;
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'system': return <FaCog className="me-1" />;
      case 'maintenance': return <FaTools className="me-1" />;
      case 'backup': return <FaDatabase className="me-1" />;
      case 'ai': return <FaCode className="me-1" />;
      case 'feature': return <FaInfoCircle className="me-1" />;
      default: return <FaBell className="me-1" />;
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const criticalNotifications = notifications.filter(n => n.priority === 'critical');

  return (
    <div className="system-notifications-container">
      {/* Estado del Sistema */}
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

      {/* Lista de Notificaciones */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <FaBell className="me-2" />
            Notificaciones del Sistema
            <Button 
              variant="outline-primary" 
              size="sm" 
              className="float-end"
              onClick={loadNotifications}
            >
              <FaTerminal className="me-1" />
              Actualizar
            </Button>
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          {notifications.length === 0 ? (
            <div className="text-center py-4">
              <FaCheckCircle className="text-success mb-2" size={48} />
              <h5>No hay notificaciones</h5>
              <p className="text-muted">Todo está funcionando correctamente</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notification, index) => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <Row className="align-items-center">
                    <Col md={1} className="text-center">
                      {getNotificationIcon(notification.type)}
                    </Col>
                    <Col md={8}>
                      <div className="notification-content">
                        <div className="d-flex align-items-center mb-1">
                          {getCategoryIcon(notification.category)}
                          <h6 className="mb-0 fw-bold">{notification.title}</h6>
                          {!notification.read && <Badge bg="primary" className="ms-2">Nuevo</Badge>}
                        </div>
                        <p className="mb-1 text-muted">{notification.message}</p>
                        <small className="text-muted">
                          {notification.timestamp.toLocaleString('es-MX')}
                        </small>
                      </div>
                    </Col>
                    <Col md={3} className="text-end">
                      <div className="notification-actions">
                        {getPriorityBadge(notification.priority)}
                        {notification.actionUrl && (
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="ms-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Navegar a la URL de acción
                              console.log('Navigate to:', notification.actionUrl);
                            }}
                          >
                            Ver
                          </Button>
                        )}
                      </div>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Toast Notifications */}
      <ToastContainer position="top-end" className="p-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            show={toast.show}
            onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            delay={5000}
            autohide
            className={`border-${toast.type === 'error' ? 'danger' : toast.type}`}
          >
            <Toast.Header>
              {getNotificationIcon(toast.type)}
              <strong className="me-auto ms-2">{toast.title}</strong>
            </Toast.Header>
            <Toast.Body>{toast.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </div>
  );
};

export default SystemNotifications;