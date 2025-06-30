import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Button, Form, Badge, Alert, Spinner } from 'react-bootstrap';
import { 
  FaTerminal, 
  FaPlay, 
  FaPause, 
  FaTrash, 
  FaDownload, 
  FaFilter,
  FaSearch,
  FaCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaExclamationCircle
} from 'react-icons/fa';
import apiService from '../../services/apiService';
import './BackendLogs.css';

const BackendLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [filterLevel, setFilterLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [maxLogs, setMaxLogs] = useState(500);
  
  const logsContainerRef = useRef(null);
  const eventSourceRef = useRef(null);

  // Cargar logs iniciales
  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.get('/logs', {
        params: { limit: maxLogs, level: filterLevel !== 'all' ? filterLevel : undefined }
      });
      
      if (response.data.success) {
        setLogs(response.data.logs);
      }
    } catch (err) {
      console.error('Error loading logs:', err);
      setError('Error al cargar los logs del backend');
    } finally {
      setLoading(false);
    }
  }, [maxLogs, filterLevel]);

  // Filtrar logs según criterios
  useEffect(() => {
    let filtered = [...logs];
    
    // Filtrar por nivel
    if (filterLevel !== 'all') {
      filtered = filtered.filter(log => 
        log.level.toLowerCase() === filterLevel.toLowerCase()
      );
    }
    
    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(search) ||
        log.level.toLowerCase().includes(search)
      );
    }
    
    setFilteredLogs(filtered);
  }, [logs, filterLevel, searchTerm]);

  // Auto scroll al final
  useEffect(() => {
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll]);

  // Inicializar streaming de logs
  const startStreaming = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      // Usar la URL base del API para el EventSource
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const streamUrl = `${API_BASE_URL}/logs/stream`;
      
      console.log('Conectando a:', streamUrl);
      const eventSource = new EventSource(streamUrl);
      eventSourceRef.current = eventSource;
      
      eventSource.onopen = () => {
        setStreaming(true);
        setError(null);
        console.log('📡 Conexión de logs establecida');
      };
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'initial') {
            setLogs(data.logs);
          } else if (data.type === 'new') {
            setLogs(prev => [data.log, ...prev].slice(0, maxLogs));
          }
        } catch (err) {
          console.error('Error parsing log data:', err);
        }
      };
      
      eventSource.onerror = (err) => {
        console.error('EventSource error:', err);
        setStreaming(false);
        setError('Error en la conexión de streaming de logs');
        eventSource.close();
      };
      
    } catch (err) {
      console.error('Error starting stream:', err);
      setError('No se pudo iniciar el streaming de logs');
    }
  }, [maxLogs]);

  // Detener streaming
  const stopStreaming = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setStreaming(false);
  }, []);

  // Limpiar logs
  const clearLogs = async () => {
    try {
      await apiService.post('/logs/clear');
      setLogs([]);
      console.log('🧹 Logs limpiados');
    } catch (err) {
      console.error('Error clearing logs:', err);
      setError('Error al limpiar logs');
    }
  };

  // Descargar logs
  const downloadLogs = async (format = 'json') => {
    try {
      const response = await apiService.get(`/logs/download?format=${format}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backend-logs-${new Date().toISOString().slice(0, 10)}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading logs:', err);
      setError('Error al descargar logs');
    }
  };

  // Obtener icono y color según nivel de log
  const getLogLevelConfig = (level) => {
    const configs = {
      ERROR: { icon: <FaExclamationCircle />, color: 'danger', bg: 'rgba(220, 53, 69, 0.1)' },
      WARN: { icon: <FaExclamationTriangle />, color: 'warning', bg: 'rgba(255, 193, 7, 0.1)' },
      WARNING: { icon: <FaExclamationTriangle />, color: 'warning', bg: 'rgba(255, 193, 7, 0.1)' },
      INFO: { icon: <FaInfoCircle />, color: 'info', bg: 'rgba(13, 202, 240, 0.1)' },
      DEBUG: { icon: <FaCircle />, color: 'secondary', bg: 'rgba(108, 117, 125, 0.1)' }
    };
    
    return configs[level.toUpperCase()] || configs.INFO;
  };

  // Formatear timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  // Efectos de inicialización
  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, [stopStreaming]);

  return (
    <div className="backend-logs-container">
      {/* Controles */}
      <Card className="mb-3">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FaTerminal className="me-2" />
              Logs del Backend
            </h5>
            
            <div className="d-flex gap-2">
              {!streaming ? (
                <Button 
                  variant="outline-success" 
                  size="sm" 
                  onClick={startStreaming}
                  style={{ 
                    borderRadius: '8px',
                    borderColor: '#28a745',
                    color: '#28a745'
                  }}
                >
                  <FaPlay className="me-1" />
                  Iniciar Stream
                </Button>
              ) : (
                <Button 
                  variant="outline-warning" 
                  size="sm" 
                  onClick={stopStreaming}
                  style={{ 
                    borderRadius: '8px',
                    borderColor: '#ffc107',
                    color: '#856404'
                  }}
                >
                  <FaPause className="me-1" />
                  Pausar Stream
                </Button>
              )}
              
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={clearLogs}
                style={{ 
                  borderRadius: '8px',
                  borderColor: '#6c757d',
                  color: '#6c757d'
                }}
              >
                <FaTrash className="me-1" />
                Limpiar
              </Button>
              
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={() => downloadLogs('json')}
                style={{ 
                  borderRadius: '8px',
                  borderColor: '#0d6efd',
                  color: '#0d6efd'
                }}
              >
                <FaDownload className="me-1" />
                Descargar
              </Button>
            </div>
          </div>
        </Card.Header>
        
        <Card.Body>
          <div className="row align-items-center">
            <div className="col-md-3">
              <Form.Group>
                <Form.Label><FaFilter className="me-1" />Nivel</Form.Label>
                <Form.Select 
                  value={filterLevel} 
                  onChange={(e) => setFilterLevel(e.target.value)}
                  size="sm"
                >
                  <option value="all">Todos los niveles</option>
                  <option value="error">Solo Errores</option>
                  <option value="warning">Solo Warnings</option>
                  <option value="info">Solo Info</option>
                  <option value="debug">Solo Debug</option>
                </Form.Select>
              </Form.Group>
            </div>
            
            <div className="col-md-4">
              <Form.Group>
                <Form.Label><FaSearch className="me-1" />Buscar</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Buscar en logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="sm"
                />
              </Form.Group>
            </div>
            
            <div className="col-md-2">
              <Form.Group>
                <Form.Label>Máximo</Form.Label>
                <Form.Select 
                  value={maxLogs} 
                  onChange={(e) => setMaxLogs(parseInt(e.target.value))}
                  size="sm"
                >
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                  <option value={1000}>1000</option>
                </Form.Select>
              </Form.Group>
            </div>
            
            <div className="col-md-3">
              <Form.Check 
                type="switch"
                label="Auto scroll"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
              />
              <small className="text-muted">
                {filteredLogs.length} de {logs.length} logs
              </small>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Logs Container */}
      <Card>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" className="mb-3" />
              <p>Cargando logs...</p>
            </div>
          ) : (
            <div 
              ref={logsContainerRef}
              className="logs-container"
              style={{ 
                height: '600px', 
                overflowY: 'auto',
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                fontSize: '0.85rem',
                backgroundColor: '#1e1e1e',
                color: '#d4d4d4'
              }}
            >
              {filteredLogs.length === 0 ? (
                <div className="text-center py-5">
                  <FaTerminal size={48} className="text-muted mb-3" />
                  <h6 className="text-muted">No hay logs disponibles</h6>
                  <p className="text-muted">
                    {logs.length === 0 ? 'Inicia el streaming o recarga los logs' : 'Ajusta los filtros de búsqueda'}
                  </p>
                </div>
              ) : (
                <div className="logs-list">
                  {filteredLogs.map((log) => {
                    const config = getLogLevelConfig(log.level);
                    return (
                      <div 
                        key={log.id} 
                        className="log-entry"
                        style={{ 
                          padding: '8px 12px',
                          borderLeft: `3px solid var(--bs-${config.color})`,
                          backgroundColor: config.bg,
                          borderBottom: '1px solid rgba(255,255,255,0.1)'
                        }}
                      >
                        <div className="d-flex align-items-start">
                          <span 
                            className={`text-${config.color} me-2`}
                            style={{ minWidth: '16px' }}
                          >
                            {config.icon}
                          </span>
                          <span className="log-timestamp me-2" style={{ minWidth: '120px', fontSize: '0.75rem', color: '#adb5bd !important' }}>
                            {formatTimestamp(log.timestamp)}
                          </span>
                          <Badge bg={config.color} className="me-2" style={{ minWidth: '60px' }}>
                            {log.level}
                          </Badge>
                          <span className="flex-grow-1" style={{ wordBreak: 'break-word' }}>
                            {log.message}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default BackendLogs;