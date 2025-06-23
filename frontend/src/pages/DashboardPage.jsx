import React, { useState, useEffect } from 'react';
import { Card, Alert, Spinner, Table, Button, Badge, ProgressBar } from 'react-bootstrap';
import { FaChartLine, FaDollarSign, FaShoppingCart, FaCalendarAlt, FaSyncAlt, FaTags, FaUsers, FaCreditCard, FaMoneyBillWave, FaTrophy, FaBoxes, FaChartPie, FaChartBar } from 'react-icons/fa';
import apiService from '../services/apiService';
import { BarChart, PieChart, HorizontalBarChart } from '../components/dashboard/Charts';
import '../components/dashboard/Dashboard.css'; // Cambiar a la ubicación correcta

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
      setError('Error al cargar datos desde Google Sheets. Verifica la configuración.');
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

  // Análisis avanzado de datos
  const getAdvancedMetrics = () => {
    if (!salesData?.data) return null;

    const data = salesData.data;
    
    // Métricas por categoría
    const categorySales = {};
    const brandSales = {};
    const paymentMethods = {};
    const clientAnalysis = {};
    
    let totalRevenue = 0;
    let totalQuantity = 0;
    
    data.forEach(item => {
      // Categorías
      const category = item.categoria || 'Sin categoría';
      if (!categorySales[category]) {
        categorySales[category] = { count: 0, revenue: 0, quantity: 0 };
      }
      categorySales[category].count++;
      categorySales[category].revenue += parseFloat(item.venta_total || 0);
      categorySales[category].quantity += parseInt(item.cantidad || 0);
      
      // Marcas
      const brand = item.marca || 'Sin marca';
      if (!brandSales[brand]) {
        brandSales[brand] = { count: 0, revenue: 0 };
      }
      brandSales[brand].count++;
      brandSales[brand].revenue += parseFloat(item.venta_total || 0);
      
      // Métodos de pago
      const paymentMethod = item.venta_paymentMethod || 'No especificado';
      if (!paymentMethods[paymentMethod]) {
        paymentMethods[paymentMethod] = { count: 0, revenue: 0 };
      }
      paymentMethods[paymentMethod].count++;
      paymentMethods[paymentMethod].revenue += parseFloat(item.venta_total || 0);
      
      // Clientes
      const client = item.venta_clientName || 'Cliente anónimo';
      if (!clientAnalysis[client]) {
        clientAnalysis[client] = { count: 0, revenue: 0 };
      }
      clientAnalysis[client].count++;
      clientAnalysis[client].revenue += parseFloat(item.venta_total || 0);
      
      totalRevenue += parseFloat(item.venta_total || 0);
      totalQuantity += parseInt(item.cantidad || 0);
    });

    return {
      categorySales: Object.entries(categorySales).sort(([,a], [,b]) => b.revenue - a.revenue),
      brandSales: Object.entries(brandSales).sort(([,a], [,b]) => b.revenue - a.revenue),
      paymentMethods: Object.entries(paymentMethods).sort(([,a], [,b]) => b.revenue - a.revenue),
      topClients: Object.entries(clientAnalysis).sort(([,a], [,b]) => b.revenue - a.revenue).slice(0, 10),
      totalRevenue,
      totalQuantity,
      averageTicket: totalRevenue / data.length
    };
  };

  const advancedMetrics = getAdvancedMetrics();

  if (loading) {
    return (
      <div className="dashboard-loading-container">
        <div className="text-center">
          <Spinner animation="border" size="lg" className="mb-3" />
          <h5>Cargando dashboard desde Google Sheets...</h5>
          <p className="text-muted">Analizando datos de ventas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-main-container">
      <div className="dashboard-content-wrapper">
        {/* Header del Dashboard */}
        <div className="row mb-4">
          <div className="col">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="mb-1 display-6">Dashboard de Ventas</h1>
                <p className="text-muted mb-0">Análisis completo de datos desde Google Sheets</p>
              </div>
              <Button variant="outline-primary" onClick={loadDashboardData} disabled={loading}>
                <FaSyncAlt className="me-2" />
                Actualizar
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Métricas principales */}
        {advancedMetrics && (
          <>
            <div className="row mb-4">
              <div className="col-md-3">
                <Card className="border-primary h-100 shadow-sm">
                  <Card.Body className="text-center">
                    <FaShoppingCart className="text-primary mb-2" size={32} />
                    <h2 className="text-primary mb-1">{salesData.data.length}</h2>
                    <small className="text-muted">Total de Ventas</small>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-3">
                <Card className="border-success h-100 shadow-sm">
                  <Card.Body className="text-center">
                    <FaDollarSign className="text-success mb-2" size={32} />
                    <h2 className="text-success mb-1">{formatCurrency(advancedMetrics.totalRevenue)}</h2>
                    <small className="text-muted">Ingresos Totales</small>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-3">
                <Card className="border-info h-100 shadow-sm">
                  <Card.Body className="text-center">
                    <FaBoxes className="text-info mb-2" size={32} />
                    <h2 className="text-info mb-1">{advancedMetrics.totalQuantity}</h2>
                    <small className="text-muted">Productos Vendidos</small>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-3">
                <Card className="border-warning h-100 shadow-sm">
                  <Card.Body className="text-center">
                    <FaChartLine className="text-warning mb-2" size={32} />
                    <h2 className="text-warning mb-1">{formatCurrency(advancedMetrics.averageTicket)}</h2>
                    <small className="text-muted">Ticket Promedio</small>
                  </Card.Body>
                </Card>
              </div>
            </div>

            {/* Análisis por categorías y marcas */}
            <div className="row mb-4">
              <div className="col-md-6">
                <Card className="h-100 shadow-sm">
                  <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0"><FaTags className="me-2" />Top Categorías por Ventas</h5>
                  </Card.Header>
                  <Card.Body>
                    {advancedMetrics.categorySales.slice(0, 8).map(([category, data], index) => (
                      <div key={category} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold">{index + 1}. {category}</span>
                          <Badge bg="primary">{formatCurrency(data.revenue)}</Badge>
                        </div>
                        <ProgressBar 
                          now={(data.revenue / advancedMetrics.categorySales[0][1].revenue) * 100} 
                          variant={index === 0 ? 'success' : index === 1 ? 'info' : 'secondary'}
                          style={{ height: '8px' }}
                        />
                        <small className="text-muted">{data.count} ventas • {data.quantity} productos</small>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </div>
              
              <div className="col-md-6">
                <Card className="h-100 shadow-sm">
                  <Card.Header className="bg-success text-white">
                    <h5 className="mb-0"><FaTrophy className="me-2" />Top Marcas por Ingresos</h5>
                  </Card.Header>
                  <Card.Body>
                    {advancedMetrics.brandSales.slice(0, 8).map(([brand, data], index) => (
                      <div key={brand} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold">{index + 1}. {brand}</span>
                          <Badge bg="success">{formatCurrency(data.revenue)}</Badge>
                        </div>
                        <ProgressBar 
                          now={(data.revenue / advancedMetrics.brandSales[0][1].revenue) * 100} 
                          variant={index === 0 ? 'warning' : index === 1 ? 'info' : 'secondary'}
                          style={{ height: '8px' }}
                        />
                        <small className="text-muted">{data.count} ventas</small>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </div>
            </div>

            {/* Sección de Gráficas - NUEVA */}
            <div className="row mb-4">
              <div className="col-12 mb-3">
                <h3 className="text-center text-primary">
                  <FaChartPie className="me-2" />
                  Análisis Visual de Datos
                </h3>
                <hr className="mb-4" />
              </div>
            </div>

            {/* Gráficas de Pastel y Barras */}
            <div className="row mb-4">
              {/* Gráfica de Pastel - Ingresos por Categoría */}
              <div className="col-lg-4 mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Header className="bg-gradient" style={{ background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)' }}>
                    <h5 className="mb-0 text-white">
                      <FaChartPie className="me-2" />
                      Distribución por Categoría
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <PieChart 
                      data={advancedMetrics.categorySales.slice(0, 8).map(([category, data]) => ({
                        label: category,
                        value: data.revenue
                      }))}
                      title=""
                      height={400}
                    />
                  </Card.Body>
                </Card>
              </div>

              {/* Gráfica de Pastel - Métodos de Pago */}
              <div className="col-lg-4 mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Header className="bg-gradient" style={{ background: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)' }}>
                    <h5 className="mb-0 text-white">
                      <FaCreditCard className="me-2" />
                      Métodos de Pago
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <PieChart 
                      data={advancedMetrics.paymentMethods.map(([method, data]) => ({
                        label: method === 'efectivo' ? 'Efectivo 💵' : method === 'tarjeta' ? 'Tarjeta 💳' : method,
                        value: data.revenue
                      }))}
                      title=""
                      height={400}
                    />
                  </Card.Body>
                </Card>
              </div>

              {/* Gráfica de Barras - Top Marcas */}
              <div className="col-lg-4 mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Header className="bg-gradient" style={{ background: 'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)' }}>
                    <h5 className="mb-0 text-white">
                      <FaChartBar className="me-2" />
                      Top Marcas
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <BarChart 
                      data={advancedMetrics.brandSales.slice(0, 10).map(([brand, data]) => ({
                        label: brand.length > 12 ? brand.substring(0, 12) + '...' : brand,
                        value: data.revenue
                      }))}
                      title=""
                      height={400}
                    />
                  </Card.Body>
                </Card>
              </div>
            </div>

            {/* Métodos de pago y clientes top */}
            <div className="row mb-4">
              <div className="col-md-6">
                <Card className="h-100 shadow-sm">
                  <Card.Header className="bg-info text-white">
                    <h5 className="mb-0"><FaCreditCard className="me-2" />Métodos de Pago</h5>
                  </Card.Header>
                  <Card.Body>
                    {advancedMetrics.paymentMethods.map(([method, data], index) => (
                      <div key={method} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold">
                            {method === 'efectivo' && <FaMoneyBillWave className="me-1 text-success" />}
                            {method === 'tarjeta' && <FaCreditCard className="me-1 text-primary" />}
                            {method}
                          </span>
                          <div>
                            <Badge bg="info" className="me-1">{data.count}</Badge>
                            <Badge bg="dark">{formatCurrency(data.revenue)}</Badge>
                          </div>
                        </div>
                        <ProgressBar 
                          now={(data.revenue / advancedMetrics.paymentMethods[0][1].revenue) * 100} 
                          variant="info"
                          style={{ height: '6px' }}
                        />
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </div>
              
              <div className="col-md-6">
                <Card className="h-100 shadow-sm">
                  <Card.Header className="bg-warning text-dark">
                    <h5 className="mb-0"><FaUsers className="me-2" />Top Clientes</h5>
                  </Card.Header>
                  <Card.Body>
                    {advancedMetrics.topClients.map(([client, data], index) => (
                      <div key={client} className="mb-2 p-2 border-bottom">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <span className="fw-bold text-truncate" style={{ maxWidth: '200px' }}>
                              {index + 1}. {client}
                            </span>
                            <br />
                            <small className="text-muted">{data.count} compras</small>
                          </div>
                          <Badge bg="warning" text="dark">{formatCurrency(data.revenue)}</Badge>
                        </div>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </div>
            </div>
          </>
        )}

        {/* Tabla de datos recientes */}
        {salesData?.data && (
          <div className="row">
            <div className="col">
              <Card className="shadow-sm">
                <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Ventas Recientes</h5>
                  <Badge bg="light" text="dark">
                    {salesData.data.length} registros totales
                  </Badge>
                </Card.Header>
                <Card.Body className="p-0">
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <Table responsive striped hover className="mb-0">
                      <thead className="bg-light sticky-top">
                        <tr>
                          <th>Producto</th>
                          <th>Categoría</th>
                          <th>Marca</th>
                          <th>Cantidad</th>
                          <th>Precio Unit.</th>
                          <th>Total</th>
                          <th>Cliente</th>
                          <th>Pago</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesData.data.slice(0, 50).map((row, index) => (
                          <tr key={index}>
                            <td className="fw-bold">{row.nombre || '--'}</td>
                            <td>
                              <Badge bg="secondary" pill>{row.categoria || 'N/A'}</Badge>
                            </td>
                            <td>{row.marca || '--'}</td>
                            <td className="text-center">
                              <Badge bg="info">{row.cantidad || 0}</Badge>
                            </td>
                            <td>{formatCurrency(parseFloat(row.precio) || 0)}</td>
                            <td className="fw-bold text-success">
                              {formatCurrency(parseFloat(row.venta_total) || 0)}
                            </td>
                            <td>{row.venta_clientName || 'Anónimo'}</td>
                            <td>
                              <Badge bg={row.venta_paymentMethod === 'efectivo' ? 'success' : 'primary'}>
                                {row.venta_paymentMethod || 'N/A'}
                              </Badge>
                            </td>
                            <td>{formatDate(row.venta_timestamp)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                  {salesData.data.length > 50 && (
                    <div className="text-center p-3 bg-light">
                      <small className="text-muted">
                        Mostrando 50 de {salesData.data.length} registros
                      </small>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>
          </div>
        )}

        {/* Footer con información de actualización */}
        {lastUpdated && (
          <div className="row mt-4">
            <div className="col">
              <Card className="bg-light border-0">
                <Card.Body className="py-2 text-center">
                  <small className="text-muted">
                    <FaCalendarAlt className="me-1" />
                    Última actualización: {lastUpdated.toLocaleString('es-MX')}
                    {metrics?.lastUpdated && (
                      <> | Datos de Google Sheets: {new Date(metrics.lastUpdated).toLocaleString('es-MX')}</>
                    )}
                  </small>
                </Card.Body>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;