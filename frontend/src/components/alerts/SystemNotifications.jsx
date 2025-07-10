import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from 'react-bootstrap';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaCog, 
  FaDatabase, 
  FaBell,
  FaTools,
  FaCode
} from 'react-icons/fa';

// Componentes
import StatusCard from './components/StatusCard';
import NotificationsSummary from './components/NotificationsSummary';
import NotificationsList from './components/NotificationsList';
import ToastNotifications from './components/ToastNotifications';

// Servicios
import apiService from '../../services/apiService';

// Estilos
import '../../styles/components/alerts/notifications.css';

/**
 * Componente principal del Centro de Alertas y Estado del Sistema
 * Muestra el estado actual de conexión con servicios clave y notificaciones importantes
 */
const SystemNotifications = ({ backendStatus }) => {
  // ESTADOS
  const [systemStatus, setSystemStatus] = useState({
    backend: backendStatus?.isOnline ? 'online' : 'offline',
    database: 'checking',
    sheets: 'checking',
    lastCheck: backendStatus?.lastChecked || null,
    errorType: backendStatus?.errorType || null,
    errorMessage: backendStatus?.error || null
  });
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  // EFECTOS

  // Actualizar el estado del backend cuando cambie la prop
  useEffect(() => {
    if (backendStatus) {
      setSystemStatus(prev => ({
        ...prev,
        backend: backendStatus.isOnline ? 'online' : 'offline',
        lastCheck: backendStatus.lastChecked,
        errorType: backendStatus.errorType || null,
        errorMessage: backendStatus.error || null
      }));
      
      // Si hay error CORS, mostrar una notificación especial
      if (backendStatus.errorType === 'cors' && !backendStatus.isOnline) {
        addNotification({
          id: `cors-${Date.now()}`,
          type: 'warning',
          title: 'Error CORS Detectado',
          message: 'Configuración incorrecta de CORS en el servidor. Contacte al administrador.',
          date: new Date(),
          unread: true,
          icon: <FaCode />,
          solution: 'Verifique la configuración CORS en el archivo backend/config/cors.js'
        });
      }
    }
  }, [backendStatus]);

  /**
   * Verifica el estado de los servicios externos (Firebase y Google Sheets)
   * Implementa manejo de errores y actualiza el estado del sistema
   */
  const checkOtherServices = useCallback(async () => {
    try {
      // Inicializar estado de verificación
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
        console.error('Error al verificar Firebase:', error);
      }

      // Verificar Google Sheets
      try {
        const sheetsResponse = await apiService.getSalesDataFromSheets();
        newStatus.sheets = sheetsResponse.success ? 'online' : 'offline';
      } catch (error) {
        newStatus.sheets = 'offline';
        showToast('warning', 'Google Sheets desconectado', 'Verificar configuración de API');
      }

      // Actualizar estado del sistema con los resultados
      setSystemStatus(prev => ({
        ...prev,
        database: newStatus.database,
        sheets: newStatus.sheets,
        lastCheck: newStatus.lastCheck
      }));
    } catch (error) {
      console.error('Error al verificar servicios externos:', error);
    }
  }, []);

  /**
   * Efecto para inicializar verificaciones y configurar intervalos de actualización
   */
  useEffect(() => {
    // Verificar servicios y cargar notificaciones al inicio
    checkOtherServices();
    loadNotifications();
    
    // Configurar intervalos de actualización automática
    const statusInterval = setInterval(checkOtherServices, 30000); // Cada 30 segundos
    const notificationInterval = setInterval(loadNotifications, 5 * 60 * 1000); // Cada 5 minutos
    
    // Limpieza de intervalos al desmontar
    return () => {
      clearInterval(statusInterval);
      clearInterval(notificationInterval);
    };
  }, [checkOtherServices]);

  // FUNCIONES PARA NOTIFICACIONES
  
  /**
   * Muestra una notificación toast temporal
   * @param {string} type - Tipo de notificación (success, warning, error, info)
   * @param {string} title - Título de la notificación
   * @param {string} message - Mensaje de la notificación
   */
  const showToast = useCallback((type, title, message) => {
    const newToast = {
      id: `toast-${Date.now()}`,
      type,
      title,
      message,
      timestamp: new Date()
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 5000);
  }, []);
  
  /**
   * Añade una nueva notificación al sistema
   * @param {Object} notification - La notificación a añadir
   */
  const addNotification = useCallback((notification) => {
    // Comprobar si ya existe una notificación similar para evitar duplicados
    const exists = notifications.some(n => 
      n.title === notification.title && 
      n.type === notification.type
    );
    
    if (!exists) {
      setNotifications(prev => [notification, ...prev]);
      
      // Mostrar también como toast si es importante (warning o error)
      if (['warning', 'error'].includes(notification.type)) {
        showToast(notification.type, notification.title, notification.message);
      }
    }
  }, [notifications, showToast]);
  
  /**
   * Carga notificaciones del sistema (simuladas)
   * En un entorno de producción, estas vendrían de una API
   */
  const loadNotifications = () => {
    const mockNotifications = [
      {
        id: 1,
        type: 'info',
        title: 'Actualización de Sistema',
        message: 'Nueva versión v2.1.0 disponible con mejoras en el dashboard de ventas.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
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
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
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
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
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
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
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
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        priority: 'medium',
        category: 'feature',
        read: false,
        actionUrl: '/alerts'
      }
    ];

    setNotifications(mockNotifications);
  };

  /**
   * Muestra una notificación toast temporal
   * @param {string} type - Tipo de notificación: 'success', 'error', 'warning', 'info'
   * @param {string} title - Título de la notificación
   * @param {string} message - Mensaje de la notificación
   * Esta función ya está definida arriba usando useCallback
   */

  /**
   * Marca una notificación como leída
   * @param {number} notificationId - ID de la notificación a marcar
   */
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // UTILIDADES PARA RENDERIZADO
  
  /**
   * Devuelve el ícono correspondiente al tipo de notificación
   * @param {string} type - Tipo de notificación
   * @returns {JSX.Element} Elemento React con el ícono
   */
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <FaCheckCircle className="text-success" />;
      case 'error': return <FaTimesCircle className="text-danger" />;
      case 'warning': return <FaExclamationTriangle className="text-warning" />;
      case 'info': return <FaInfoCircle className="text-info" />;
      default: return <FaBell className="text-primary" />;
    }
  };

  /**
   * Devuelve un badge con el nivel de prioridad formateado
   * @param {string} priority - Nivel de prioridad: 'critical', 'high', 'medium', 'low'
   * @returns {JSX.Element} Badge con el texto y color correspondiente
   */
  const getPriorityBadge = (priority) => {
    const variants = {
      critical: 'danger',
      high: 'warning',
      medium: 'info',
      low: 'secondary'
    };
    return <Badge bg={variants[priority]} pill>{priority.toUpperCase()}</Badge>;
  };

  /**
   * Devuelve el ícono correspondiente a la categoría de la notificación
   * @param {string} category - Categoría de la notificación
   * @returns {JSX.Element} Elemento React con el ícono
   */
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

  // RENDERIZADO
  return (
    <div className="system-notifications-container">
      {/* Componente de Estado del Sistema */}
      <StatusCard systemStatus={systemStatus} />
      
      {/* Componente de Resumen de Notificaciones */}
      <NotificationsSummary notifications={notifications} />
      
      {/* Componente de Lista de Notificaciones */}
      <NotificationsList
        notifications={notifications}
        loadNotifications={loadNotifications}
        markAsRead={markAsRead}
        getNotificationIcon={getNotificationIcon}
        getCategoryIcon={getCategoryIcon}
        getPriorityBadge={getPriorityBadge}
      />
      
      {/* Componente de Notificaciones Toast */}
      <ToastNotifications
        toasts={toasts}
        getNotificationIcon={getNotificationIcon}
        setToasts={setToasts}
      />
    </div>
  );
};

export default SystemNotifications;