import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import apiService from '../../services/apiService';
import './inventory.css';

const AutomaticRegistration = ({ onProductRegistered }) => {
  const [barcode, setBarcode] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState('almacen-principal');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  return (
    <div className="automatic-registration">
      <Card className="mb-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0">
            <i className="bi bi-info-circle me-2"></i>
            Instrucciones para el Registro con Código de Barras
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={8}>
              <ol>
                <li className="mb-2">Ingrese el código de barras manualmente o utilice un escáner.</li>
                <li className="mb-2">Presione Enter o haga clic en "Buscar Producto" para encontrar el artículo.</li>
                <li className="mb-2">Una vez encontrado, verifique los datos del producto mostrados.</li>
                <li className="mb-2">Ajuste la cantidad de unidades a registrar si es necesario.</li>
                <li className="mb-2">Seleccione la ubicación donde se registrará el inventario.</li>
                <li>Haga clic en "Registrar en Inventario" para finalizar el proceso.</li>
              </ol>
            </Col>
            <Col md={4}>
              <Alert variant="info" className="h-100 mb-0 d-flex align-items-center">
                <div>
                  <i className="bi bi-lightbulb-fill me-2 fs-4"></i>
                  <strong>Consejos:</strong>
                  <p className="mb-0 mt-2">
                    Para mayor eficiencia, mantenga el cursor en el campo de código de barras y utilice un escáner. 
                    El sistema detectará automáticamente el producto cuando el código sea escaneado.
                  </p>
                </div>
              </Alert>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row>
        <Col md={6}>
          {/* Resto del contenido existente... */}
        </Col>
        
        <Col md={6}>
          {/* Resto del contenido existente... */}
        </Col>
      </Row>
    </div>
  );
};

export default AutomaticRegistration;

/* eslint-disable no-unused-vars */
// Resto del código existente