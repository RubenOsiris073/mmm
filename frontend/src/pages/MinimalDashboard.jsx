import React, { useState, useEffect } from 'react';
import { Card, Alert, Spinner, Button, Row, Col } from 'react-bootstrap';
import { FaChartLine, FaDollarSign, FaShoppingCart, FaSyncAlt, FaUsers, FaBoxes, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import apiService from '../services/apiService';
import { 
  RealtimeLineChart, 
  MinimalBarChart, 
  MinimalDonutChart, 
  ProgressAreaChart,
  InventoryTrendChart 
} from '../components/dashboard/ApexCharts';
import '../styles/components/apex-charts.css';

const MinimalDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadDashboardData();
    // Actualizar datos cada 30 segundos para efecto real-time
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
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
      setError('Error al cargar datos. Verificando conexión...');
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

  // Procesar datos para los gráficos
  const processChartData = () => {
    if (!salesData?.data) return null;

    const data = salesData.data;
    
    // Datos para gráfico de líneas en tiempo real
    const timeSeriesData = data.map((item, index) => ({
      x: new Date().getTime() - (data.length - index) * 60000, // Simular timestamps
      y: parseFloat(item.venta_total || 0)
    }));

    // Datos para gráfico de barras por categoría
    const categorySales = {};
    data.forEach(item => {
      const category = item.categoria || 'Sin categoría';
      categorySales[category] = (categorySales[category] || 0) + parseFloat(item.venta_total || 0);
    });

    const categoryData = {
      categories: Object.keys(categorySales),
      series: [{
        name: 'Ventas',
        data: Object.values(categorySales)
      }]
    };

    // Datos para gráfico de donut de métodos de pago
    const paymentMethods = {};
    data.forEach(item => {
      const method = item.venta_paymentMethod || 'No especificado';
      paymentMethods[method] = (paymentMethods[method] || 0) + 1;
    });

    const paymentData = {
      labels: Object.keys(paymentMethods),
      series: Object.values(paymentMethods)
    };

    // Métricas principales
    const totalRevenue = data.reduce((sum, item) => sum + parseFloat(item.venta_total || 0), 0);
    const totalQuantity = data.reduce((sum, item) => sum + parseInt(item.cantidad || 0), 0);
    const averageTicket = totalRevenue / data.length;

    return {
      timeSeries: [{
        name: 'Ventas',
        data: timeSeriesData
      }],
      categoryData,
      paymentData,
      metrics: {
        totalSales: data.length,
        totalRevenue,
        totalQuantity,
        averageTicket
      }
    };
  };

  const chartData = processChartData();

  if (loading && !chartData) {
    return (
      <div className="dashboard-loading-container d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <Spinner animation="border" size="lg" className="mb-3" />
          <h5>Cargando dashboard...</h5>
          <p className="text-muted">Analizando datos en tiempo real</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="flex-grow-1">
          <h2 className="mb-1">Dashboard Analytics</h2>
          <p className="text-muted mb-0">Monitoreo en tiempo real</p>
        </div>
        <Button 
          variant="primary" 
          size="sm"
          onClick={loadDashboardData} 
          disabled={loading}
          className="px-3 py-2"
          style={{ minWidth: 'auto', width: 'auto' }}
          title="Actualizar datos"
        >
          <FaSyncAlt className={loading ? 'fa-spin' : ''} size="14" />
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {chartData && (
        <>
          {/* Métricas principales */}
          <Row className="mb-4">
            <Col md={3}>
              <div className="metric-card">
                <FaShoppingCart className="text-primary mb-2" size={24} />
                <div className="metric-value">{chartData.metrics.totalSales}</div>
                <div className="metric-label">Total Ventas</div>
                <div className="metric-change positive">
                  <FaArrowUp className="me-1" />
                  +12%
                </div>
              </div>
            </Col>
            <Col md={3}>
              <div className="metric-card">
                <FaDollarSign className="text-success mb-2" size={24} />
                <div className="metric-value">{formatCurrency(chartData.metrics.totalRevenue)}</div>
                <div className="metric-label">Ingresos</div>
                <div className="metric-change positive">
                  <FaArrowUp className="me-1" />
                  +8%
                </div>
              </div>
            </Col>
            <Col md={3}>
              <div className="metric-card">
                <FaBoxes className="text-info mb-2" size={24} />
                <div className="metric-value">{chartData.metrics.totalQuantity}</div>
                <div className="metric-label">Productos</div>
                <div className="metric-change positive">
                  <FaArrowUp className="me-1" />
                  +15%
                </div>
              </div>
            </Col>
            <Col md={3}>
              <div className="metric-card">
                <FaUsers className="text-warning mb-2" size={24} />
                <div className="metric-value">{formatCurrency(chartData.metrics.averageTicket)}</div>
                <div className="metric-label">Ticket Promedio</div>
                <div className="metric-change negative">
                  <FaArrowDown className="me-1" />
                  -3%
                </div>
              </div>
            </Col>
          </Row>

          {/* Gráficos principales */}
          <div className="dashboard-row">
            <RealtimeLineChart 
              data={chartData.timeSeries} 
              title="Ventas en Tiempo Real" 
            />
            <MinimalBarChart 
              data={chartData.categoryData} 
              title="Ventas por Categoría" 
            />
          </div>

          <div className="dashboard-row">
            <MinimalDonutChart 
              data={chartData.paymentData} 
              title="Métodos de Pago" 
            />
            <div>
              <ProgressAreaChart 
                data={[{
                  name: 'Objetivo Mensual',
                  data: [65, 78, 85, 92]
                }]} 
                title="Progreso Objetivo Mensual"
                showLabels={true}
              />
              <InventoryTrendChart 
                data={[{
                  name: 'Stock Bajo',
                  data: [12, 8, 15, 6, 9, 11, 7]
                }]} 
                title="Tendencia de Inventario" 
              />
            </div>
          </div>

          {/* Información adicional */}
          <div className="apex-chart-container">
            <div className="chart-header">
              <h6 className="chart-title">Última Actualización</h6>
            </div>
            <p className="text-muted">
              {lastUpdated ? `${lastUpdated.toLocaleString('es-MX')}` : 'Nunca'}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default MinimalDashboard;
