import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaMoneyBillWave, FaCog, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import POSLogin from './POSLogin';

const POSAccessSelector = () => {
  const [selectedAccess, setSelectedAccess] = useState(null);

  // Si se seleccionó un tipo de acceso, mostrar el login correspondiente
  if (selectedAccess) {
    return <POSLogin accessType={selectedAccess} onBack={() => setSelectedAccess(null)} />;
  }

  return (
    <div className="pos-access-selector min-vh-100 d-flex align-items-center" style={{ 
      backgroundColor: 'var(--bg-primary)', 
      color: 'var(--text-primary)' 
    }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-5"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="mb-4"
              >
                <FaMoneyBillWave size={80} className="text-primary" />
              </motion.div>
              <h1 className="display-4 fw-bold text-primary mb-3">
                Sistema de Gestión
              </h1>
              <p className="lead fs-4" style={{ color: 'var(--text-secondary)' }}>
                Seleccione el tipo de acceso que necesita
              </p>
            </motion.div>

            <Row className="g-4">
              {/* Opción Punto de Venta */}
              <Col md={6}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -10 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Card 
                    className="h-100 border-0 shadow-lg access-card"
                    style={{ 
                      backgroundColor: 'var(--card-bg)', 
                      borderColor: 'var(--border-color)',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedAccess('pos')}
                  >
                    <Card.Body className="text-center p-5">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          color: ['#007bff', '#28a745', '#007bff']
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                        className="mb-4"
                      >
                        <FaMoneyBillWave size={60} />
                      </motion.div>
                      
                      <h3 className="fw-bold mb-3 text-primary">
                        Punto de Venta
                      </h3>
                      
                      <p className="fs-5 mb-4" style={{ color: 'var(--text-secondary)' }}>
                        Procesamiento de ventas y manejo de transacciones
                      </p>
                      
                      <ul className="list-unstyled mb-4">
                        <li className="mb-2">✓ Procesamiento de ventas</li>
                        <li className="mb-2">✓ Escaneo de productos</li>
                        <li className="mb-2">✓ Gestión de carrito</li>
                        <li className="mb-2">✓ Métodos de pago</li>
                      </ul>
                      
                      <Button 
                        variant="primary" 
                        size="lg" 
                        className="w-100 fs-5 py-3"
                        onClick={() => setSelectedAccess('pos')}
                      >
                        Acceder al POS <FaArrowRight className="ms-2" />
                      </Button>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>

              {/* Opción Administración */}
              <Col md={6}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -10 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Card 
                    className="h-100 border-0 shadow-lg access-card"
                    style={{ 
                      backgroundColor: 'var(--card-bg)', 
                      borderColor: 'var(--border-color)',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedAccess('admin')}
                  >
                    <Card.Body className="text-center p-5">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          color: ['#dc3545', '#ffc107', '#dc3545']
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                        className="mb-4"
                      >
                        <FaCog size={60} />
                      </motion.div>
                      
                      <h3 className="fw-bold mb-3 text-danger">
                        Administración
                      </h3>
                      
                      <p className="fs-5 mb-4" style={{ color: 'var(--text-secondary)' }}>
                        Gestión de inventario y configuración del sistema
                      </p>
                      
                      <ul className="list-unstyled mb-4">
                        <li className="mb-2">✓ Gestión de productos</li>
                        <li className="mb-2">✓ Control de inventario</li>
                        <li className="mb-2">✓ Reportes de ventas</li>
                        <li className="mb-2">✓ Configuración general</li>
                      </ul>
                      
                      <Button 
                        variant="danger" 
                        size="lg" 
                        className="w-100 fs-5 py-3"
                        onClick={() => setSelectedAccess('admin')}
                      >
                        Acceder a Admin <FaArrowRight className="ms-2" />
                      </Button>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            </Row>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center mt-5"
            >
              <p className="text-muted">
                © {new Date().getFullYear()} Monkey Technologies. Sistema integrado de gestión comercial.
              </p>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default POSAccessSelector;