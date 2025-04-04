import React, { useState, useEffect, useRef } from 'react';
import { Button, Modal, Spinner } from 'react-bootstrap';
import { BrowserMultiFormatReader } from '@zxing/library';
import Camera from '../shared/Camera';
import '../../App.css';

const BarcodeScanner = ({ onScan, onClose, show }) => {
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const codeReader = useRef(null);

  useEffect(() => {
    if (show) {
      setIsScanning(true);
      initializeScanner();
    } else {
      cleanupScanner();
    }

    return () => {
      cleanupScanner();
    };
  }, [show]);

  const initializeScanner = async () => {
    try {
      if (!codeReader.current) {
        codeReader.current = new BrowserMultiFormatReader();
      }

      if (videoRef.current) {
        const results = await codeReader.current.decodeFromVideoElement(videoRef.current);
        if (results) {
          console.log('Código detectado:', results.getText());
          onScan(results.getText());
        }
      }
    } catch (err) {
      console.error('Error al inicializar el escáner:', err);
      setError('Error al inicializar el escáner de códigos');
    }
  };

  const cleanupScanner = () => {
    setIsScanning(false);
    if (codeReader.current) {
      codeReader.current.reset();
    }
  };

  const handleClose = () => {
    cleanupScanner();
    onClose();
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered 
      size="lg" 
      className="barcode-scanner-modal"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Escanear Código de Barras</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="scanner-container">
          {show ? (
            <>
              <Camera videoRef={videoRef} />
              <div className="scanner-overlay">
                <div className="scanner-line"></div>
              </div>
            </>
          ) : (
            <div className="text-center p-4">
              {error ? (
                <div className="alert alert-danger">
                  {error}
                  <br />
                  <small>Asegúrate de que tu dispositivo tiene una cámara y has dado los permisos necesarios.</small>
                </div>
              ) : (
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Iniciando cámara...</span>
                </Spinner>
              )}
            </div>
          )}
        </div>
        {isScanning && !error && (
          <p className="scanner-instructions mt-3">
            Coloca el código de barras frente a la cámara
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <div className="scanner-buttons">
          <Button 
            variant="secondary" 
            onClick={handleClose}
            className="scanner-btn"
          >
            Cancelar
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default BarcodeScanner;