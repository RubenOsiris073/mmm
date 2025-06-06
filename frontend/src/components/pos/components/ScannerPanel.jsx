import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaBarcode, FaBox } from 'react-icons/fa';

const ScannerPanel = ({
  onScanProduct,
  continuousDetection,
  setContinuousDetection,
  detectionLoading,
  lastDetection,
  onAddDetectedProduct
}) => {
  const renderScannerAnimation = () => (
    <motion.div 
      className="text-center p-4 bg-light rounded scanner-animation"
      animate={{
        boxShadow: ["0 0 0 rgba(0,123,255,0)", "0 0 20px rgba(0,123,255,0.7)", "0 0 0 rgba(0,123,255,0)"]
      }}
      transition={{
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity
      }}
    >
      <div className="scanner-icon-container mb-3">
        <motion.div
          className="scanner-line"
          animate={{
            top: ["0%", "90%", "0%"]
          }}
          transition={{
            duration: 2.5,
            ease: "easeInOut",
            repeat: Infinity
          }}
        />
        <FaBarcode className="scanner-barcode-icon" />
        <motion.div 
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.9, 1, 0.9]
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity
          }}
        >
          <FaBox className="scanner-product-icon" />
        </motion.div>
      </div>
      <h3 className="text-primary">Escanear Producto</h3>
      <p className="text-muted mb-0">Coloque el producto frente a la cámara</p>
    </motion.div>
  );

  return (
    <div className="detection-panel p-4 shadow-sm rounded">
      {renderScannerAnimation()}

      <div className="d-grid gap-2">
        <Button
          variant="primary"
          size="lg"
          className="mb-3 mt-3"
          onClick={onScanProduct}
          disabled={detectionLoading}
        >
          {detectionLoading ? 'Escaneando...' : 'Escanear Producto'}
        </Button>

        <div className="mb-3">
          <Form.Label className="d-flex justify-content-between">
            <span>Detección continua</span>
            <span className={continuousDetection ? "text-primary fw-bold" : "text-muted"}>
              {continuousDetection ? "Activado" : "Desactivado"}
            </span>
          </Form.Label>
          <Form.Range 
            min={0}
            max={1}
            step={1}
            value={continuousDetection ? 1 : 0}
            onChange={e => setContinuousDetection(e.target.value === '1')}
          />
        </div>
      </div>

      {lastDetection && (
        <div className="last-detection p-3 border rounded mt-3">
          <h5>Última detección: <span className="text-primary">{lastDetection.label}</span></h5>
          <p className="mb-2">
            Confianza: <span className="badge bg-info">{lastDetection.similarity.toFixed(1)}%</span>
          </p>
          
          {lastDetection.productInfo ? (
            <Button
              variant="outline-primary"
              size="sm"
              className="mt-2"
              onClick={() => onAddDetectedProduct(lastDetection.label, lastDetection.productInfo)}
            >
              Añadir al Carrito
            </Button>
          ) : (
            <p className="text-danger small mb-0">Producto no encontrado en inventario</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ScannerPanel;