import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Table, Button } from 'react-bootstrap';
import { FaChartLine, FaDollarSign, FaShoppingCart, FaCalendarAlt, FaSyncAlt } from 'react-icons/fa';
import apiService from '../services/apiService';

const DashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar métricas y datos en paralelo
      const [metricsResponse, salesResponse] = await Promise.all([
        apiService.getDashboardMetrics(),
        apiService.getSalesDataFromSheets()
      ]);

      if (metricsResponse.success) {
        setMetrics(metricsResponse.data);
      }

      if (salesResponse.success) {
        setSalesData(salesResponse.data);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Error al cargar datos desde Google Sheets. Asegúrate de que el sheet esté compartido correctamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-MX');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" size="lg" className="mb-3" />
          <h5>Cargando dashboard desde Google Sheets...</h5>
          <p className="text-muted">Esto puede tomar unos segundos</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Dashboard de Ventas</h2>
              <p className="text-muted mb-0">Datos en tiempo real desde Google Sheets</p>
            </div>
            <Button variant="outline-primary" onClick={loadDashboardData} disabled={loading}>
              <FaSyncAlt className="me-2" />
              Actualizar
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Métricas principales */}
      {metrics && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-primary h-100">
              <Card.Body className="text-center">
                <FaShoppingCart className="text-primary mb-2" size={24} />
                <h3 className="text-primary mb-1">{metrics.totalSales}</h3>
                <small className="text-muted">Total de Ventas</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-success h-100">
              <Card.Body className="text-center">
                <FaDollarSign className="text-success mb-2" size={24} />
                <h3 className="text-success mb-1">{formatCurrency(metrics.totalRevenue)}</h3>
                <small className="text-muted">Ingresos Totales</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-info h-100">
              <Card.Body className="text-center">
                <FaCalendarAlt className="text-info mb-2" size={24} />
                <h3 className="text-info mb-1">{Object.keys(metrics.salesByMonth || {}).length}</h3>
                <small className="text-muted">Meses con Ventas</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-warning h-100">
              <Card.Body className="text-center">
                <FaChartLine className="text-warning mb-2" size={24} />
                <h3 className="text-warning mb-1">{metrics.topProducts?.length || 0}</h3>
                <small className="text-muted">Productos Únicos</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row>
        {/* Productos más vendidos */}
        {metrics?.topProducts && (
          <Col md={6} className="mb-4">
            <Card>
              <Card.Header>
                <h5 className="mb-0">Productos Más Vendidos</h5>
              </Card.Header>
              <Card.Body>
                <Table responsive striped>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Ventas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.topProducts.slice(0, 10).map((product, index) => (
                      <tr key={index}>
                        <td>{product.product}</td>
                        <td>
                          <span className="badge bg-primary">{product.count}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Ventas por mes */}
        {metrics?.salesByMonth && (
          <Col md={6} className="mb-4">
            <Card>
              <Card.Header>
                <h5 className="mb-0">Ventas por Mes</h5>
              </Card.Header>
              <Card.Body>
                <Table responsive striped>
                  <thead>
                    <tr>
                      <th>Mes</th>
                      <th>Cantidad</th>
                      <th>Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(metrics.salesByMonth)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .slice(0, 12)
                      .map(([month, data]) => (
                        <tr key={month}>
                          <td>{month}</td>
                          <td>
                            <span className="badge bg-info">{data.count}</span>
                          </td>
                          <td>{formatCurrency(data.revenue)}</td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Datos recientes */}
      {salesData?.data && (
        <Row>
          <Col>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Datos Recientes de Google Sheets</h5>
                <small className="text-muted">
                  Mostrando {Math.min(salesData.data.length, 10)} de {salesData.data.length} registros
                </small>
              </Card.Header>
              <Card.Body>
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      {salesData.headers?.map((header, index) => (
                        <th key={index}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.data.slice(0, 10).map((row, index) => (
                      <tr key={index}>
                        {salesData.headers?.map((header, colIndex) => (
                          <td key={colIndex}>
                            {header.toLowerCase().includes('fecha') || header.toLowerCase().includes('date') 
                              ? formatDate(row[header])
                              : header.toLowerCase().includes('total') || header.toLowerCase().includes('monto') || header.toLowerCase().includes('importe')
                              ? formatCurrency(parseFloat(row[header]) || 0)
                              : row[header] || '--'
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {salesData.data.length > 10 && (
                  <div className="text-center mt-3">
                    <small className="text-muted">
                      Y {salesData.data.length - 10} registros más...
                    </small>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Footer con información de actualización */}
      {lastUpdated && (
        <Row className="mt-4">
          <Col>
            <Card className="bg-light">
              <Card.Body className="py-2">
                <small className="text-muted">
                  Última actualización: {lastUpdated.toLocaleString('es-MX')}
                  {metrics?.lastUpdated && (
                    <> | Datos de Google Sheets: {new Date(metrics.lastUpdated).toLocaleString('es-MX')}</>
                  )}
                </small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default DashboardPage;