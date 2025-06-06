import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Card, Button, Modal, Table } from 'react-bootstrap';

const CameraPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [cameraSpecs, setCameraSpecs] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const openCameraModal = () => {
    setShowModal(true);
    setIsLoading(true);
    setError(null);
  };

  const closeCameraModal = () => {
    setShowModal(false);
    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        // Obtener especificaciones de la cámara
        const videoTrack = stream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        const capabilities = videoTrack.getCapabilities();
        
        setCameraSpecs({
          deviceId: settings.deviceId || 'No disponible',
          groupId: settings.groupId || 'No disponible',
          label: videoTrack.label || 'Cámara sin nombre',
          width: settings.width || 'No disponible',
          height: settings.height || 'No disponible',
          aspectRatio: settings.aspectRatio?.toFixed(2) || 'No disponible',
          frameRate: settings.frameRate || 'No disponible',
          facingMode: settings.facingMode || 'No disponible',
          resizeMode: settings.resizeMode || 'No disponible',
          maxWidth: capabilities.width?.max || 'No disponible',
          maxHeight: capabilities.height?.max || 'No disponible',
          maxFrameRate: capabilities.frameRate?.max || 'No disponible',
          focusMode: capabilities.focusMode?.join(', ') || 'No disponible',
          exposureMode: capabilities.exposureMode?.join(', ') || 'No disponible',
          whiteBalanceMode: capabilities.whiteBalanceMode?.join(', ') || 'No disponible'
        });
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error accediendo a la cámara:', err);
      setError('No se pudo acceder a la cámara. Verifica los permisos.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showModal) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [showModal]);

  return (
    <>
      <Row className="mb-4">
        <Col>
          <h1 className="text-center">Test de Cámara</h1>
          <p className="text-center text-muted">
            Haz clic en el botón para probar la funcionalidad de la cámara
          </p>
        </Col>
      </Row>

      <Row>
        <Col className="text-center">
          <Button 
            variant="primary" 
            size="lg"
            onClick={openCameraModal}
            className="px-5 py-3"
          >
            <i className="bi bi-camera-fill me-2"></i>
            Probar Cámara
          </Button>
        </Col>
      </Row>

      {/* Modal de Cámara */}
      <Modal 
        show={showModal} 
        onHide={closeCameraModal}
        size="xl"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-camera-video me-2"></i>
            Test de Cámara
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <Row>
            <Col lg={8}>
              <Card className="mb-3">
                <Card.Header>
                  <h5 className="mb-0">Vista de Cámara</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  {isLoading && (
                    <div className="text-center p-5">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Cargando cámara...</span>
                      </div>
                      <p className="mt-2">Inicializando cámara...</p>
                    </div>
                  )}
                  
                  {error && (
                    <div className="alert alert-danger m-3">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {error}
                    </div>
                  )}
                  
                  {!isLoading && !error && (
                    <video
                      ref={videoRef}
                      className="w-100"
                      style={{ maxHeight: '400px', objectFit: 'cover' }}
                      playsInline
                      muted
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={4}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    Especificaciones
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table striped size="sm" className="mb-0">
                    <tbody>
                      <tr>
                        <td><strong>Nombre:</strong></td>
                        <td className="text-truncate" style={{maxWidth: '150px'}} title={cameraSpecs.label}>
                          {cameraSpecs.label || 'Cargando...'}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Resolución:</strong></td>
                        <td>{cameraSpecs.width && cameraSpecs.height ? 
                          `${cameraSpecs.width}x${cameraSpecs.height}` : 'Cargando...'}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Aspecto:</strong></td>
                        <td>{cameraSpecs.aspectRatio || 'Cargando...'}</td>
                      </tr>
                      <tr>
                        <td><strong>FPS:</strong></td>
                        <td>{cameraSpecs.frameRate || 'Cargando...'}</td>
                      </tr>
                      <tr>
                        <td><strong>Orientación:</strong></td>
                        <td>{cameraSpecs.facingMode || 'Cargando...'}</td>
                      </tr>
                      <tr>
                        <td><strong>Res. Máx:</strong></td>
                        <td>{cameraSpecs.maxWidth && cameraSpecs.maxHeight ? 
                          `${cameraSpecs.maxWidth}x${cameraSpecs.maxHeight}` : 'Cargando...'}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>FPS Máx:</strong></td>
                        <td>{cameraSpecs.maxFrameRate || 'Cargando...'}</td>
                      </tr>
                      <tr>
                        <td><strong>Enfoque:</strong></td>
                        <td className="text-truncate" style={{maxWidth: '150px'}} title={cameraSpecs.focusMode}>
                          {cameraSpecs.focusMode || 'Cargando...'}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Exposición:</strong></td>
                        <td className="text-truncate" style={{maxWidth: '150px'}} title={cameraSpecs.exposureMode}>
                          {cameraSpecs.exposureMode || 'Cargando...'}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Balance B.:</strong></td>
                        <td className="text-truncate" style={{maxWidth: '150px'}} title={cameraSpecs.whiteBalanceMode}>
                          {cameraSpecs.whiteBalanceMode || 'Cargando...'}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={closeCameraModal}>
            <i className="bi bi-x-lg me-2"></i>
            Cerrar
          </Button>
          <Button variant="success" onClick={startCamera} disabled={isLoading}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Reiniciar Cámara
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CameraPage;