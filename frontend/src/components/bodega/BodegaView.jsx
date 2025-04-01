import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import CamaraDetector from './CamaraDetector';
import InventarioTable from './InventarioTable';
import ProductoModal from './ProductModal';
import { toast } from 'react-toastify';

const BodegaView = () => {
  const [inventario, setInventario] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [productoDetectado, setProductoDetectado] = useState(null);
  const [loading, setLoading] = useState(false);

  // Manejador para cuando se detecta un objeto
  const handleDetection = (detection) => {
    console.log('Objeto detectado:', detection);
    setProductoDetectado({
      label: detection.label,
      confidence: detection.confidence,
      timestamp: new Date().toISOString()
    });
    setShowModal(true);
  };

  // Manejador para guardar producto en inventario
  const handleGuardarProducto = async (productoData) => {
    try {
      setLoading(true);
      // Aquí irá la lógica para guardar en Firebase
      // Por ahora solo actualizamos el estado local
      setInventario(prev => [...prev, {
        ...productoData,
        id: Date.now().toString(),
        fechaRegistro: new Date().toISOString()
      }]);
      setShowModal(false);
      toast.success('Producto registrado correctamente');
    } catch (error) {
      console.error('Error al guardar producto:', error);
      toast.error('Error al registrar producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>Bodega</h2>
          <p className="text-muted">
            Usa la cámara para detectar productos y administrar el inventario
          </p>
        </Col>
      </Row>

      <Row>
        <Col lg={6}>
          <CamaraDetector onDetection={handleDetection} />
        </Col>
        <Col lg={6}>
          <InventarioTable inventario={inventario} />
        </Col>
      </Row>

      <ProductoModal
        show={showModal}
        onHide={() => setShowModal(false)}
        producto={productoDetectado}
        onGuardar={handleGuardarProducto}
        loading={loading}
      />
    </Container>
  );
};

export default BodegaView;