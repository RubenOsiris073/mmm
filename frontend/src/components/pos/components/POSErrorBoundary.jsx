import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

class POSErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el state para mostrar la UI de error
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Registra el error para debugging
    console.error('POS Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Aquí podrías enviar el error a un servicio de logging
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <Alert variant="danger" className="text-center">
            <Alert.Heading>
              <FaExclamationTriangle className="me-2" />
              ¡Oops! Algo salió mal
            </Alert.Heading>
            <p>
              Ha ocurrido un error inesperado en el sistema POS. 
              Por favor, intenta recargar o contacta al soporte técnico.
            </p>
            
            <div className="d-flex gap-2 justify-content-center mt-3">
              <Button 
                variant="outline-danger" 
                onClick={this.handleRetry}
                className="d-flex align-items-center gap-2"
              >
                <FaRedo />
                Reintentar
              </Button>
              <Button 
                variant="danger" 
                onClick={() => window.location.reload()}
                className="d-flex align-items-center gap-2"
              >
                Recargar Página
              </Button>
            </div>

            {/* Mostrar detalles del error solo en desarrollo */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-3 text-start">
                <summary className="mb-2">Detalles del Error (Solo Desarrollo)</summary>
                <pre className="bg-light p-2 rounded small">
                  <strong>Error:</strong> {this.state.error.toString()}
                  <br />
                  <strong>Stack Trace:</strong>
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </Alert>

          <style jsx>{`
            .error-boundary-container {
              min-height: 400px;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default POSErrorBoundary;