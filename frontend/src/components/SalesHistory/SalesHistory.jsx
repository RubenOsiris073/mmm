import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Card, Alert } from 'react-bootstrap';
import apiService from '../../services/apiService';
import { toast } from 'react-toastify';

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSales = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener ventas
        const salesData = await apiService.getSales();
        
        // Verificar que salesData sea un array
        if (Array.isArray(salesData)) {
          console.log('Ventas cargadas correctamente:', salesData.length);
          setSales(salesData);
        } else {
          console.error('getSales no devolvió un array:', salesData);
          setSales([]);
          setError('La respuesta del servidor no tiene el formato esperado');
        }
      } catch (err) {
        console.error('Error al cargar ventas:', err);
        setError(err.message || 'Error al cargar el historial de ventas');
        setSales([]);
        toast.error('Error al cargar el historial de ventas');
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, []);

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha desconocida';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (e) {
      return 'Fecha inválida';
    }
  };
  
  // Función para formatear método de pago
  const formatPaymentMethod = (method) => {
    if (!method) return 'Desconocido';
    
    const methods = {
      'efectivo': 'Efectivo',
      'tarjeta': 'Tarjeta',
      'transferencia': 'Transferencia'
    };
    
    return methods[method.toLowerCase()] || method;
  };

  // Renderizado condicional con más seguridad
  if (loading) {
    return (
      <Container className="py-4">
        <h1 className="mb-4">Historial de Ventas</h1>
        <div className="text-center p-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Cargando ventas...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <h1 className="mb-4">Historial de Ventas</h1>
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  if (!Array.isArray(sales)) {
    // Última comprobación de seguridad
    return (
      <Container className="py-4">
        <h1 className="mb-4">Historial de Ventas</h1>
        <Alert variant="warning">
          <Alert.Heading>Datos no válidos</Alert.Heading>
          <p>No se pudo obtener la lista de ventas en un formato válido.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Historial de Ventas</h1>
      
      {sales.length > 0 ? (
        <Card className="shadow-sm">
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Método</th>
                  <th className="text-end">Total</th>
                  <th>Productos</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id || sale._id || `sale-${Math.random()}`}>
                    <td>#{sale.id || sale._id || 'N/A'}</td>
                    <td>{formatDate(sale.date || sale.fecha || sale.timestamp)}</td>
                    <td>{sale.client || sale.cliente || 'Cliente general'}</td>
                    <td>{formatPaymentMethod(sale.paymentMethod || sale.metodoPago)}</td>
                    <td className="text-end fw-bold">${(sale.total || 0).toFixed(2)}</td>
                    <td>
                      {Array.isArray(sale.items) ? (
                        <ul className="mb-0 ps-3">
                          {sale.items.slice(0, 3).map((item, index) => (
                            <li key={index}>
                              {item.nombre || item.name}: {item.cantidad || item.quantity} x ${(item.precioUnitario || item.price || 0).toFixed(2)}
                            </li>
                          ))}
                          {sale.items.length > 3 && (
                            <li>...y {sale.items.length - 3} más</li>
                          )}
                        </ul>
                      ) : (
                        <span className="text-muted">Sin detalles</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ) : (
        <Card className="text-center p-5 bg-light">
          <Card.Body>
            <h3 className="text-muted">No hay ventas registradas</h3>
            <p>Cuando realices ventas, aparecerán en esta sección.</p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default SalesHistory;