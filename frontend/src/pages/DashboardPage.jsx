import React, { useState, useEffect } from 'react';
import { Card, Alert, Spinner, Button, Row, Col } from 'react-bootstrap';
import { FaSyncAlt, FaBoxes } from 'react-icons/fa';
import apiService from '../services/apiService';
import '../styles/pages/dashboard.css';

// Componentes de dashboard - importaciones directas
import { DashboardMetrics } from '../components/dashboard/DashboardMetrics';
import { 
  RealtimeLineChart, 
  ProgressAreaChart,
  InventoryTrendChart
} from '../components/dashboard/LineCharts';
import { 
  MinimalBarChart, 
  BarChart 
} from '../components/dashboard/BarCharts';
import { 
  MinimalDonutChart, 
  PieChart 
} from '../components/dashboard/PieCharts';

const DashboardPage = () => {
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

  // Procesar datos de ventas para métricas y gráficos
  const getProcessedData = () => {
    if (!salesData?.data || salesData.data.length === 0) {
      // Datos de ejemplo cuando no hay datos reales
      return {
        metrics: {
          totalSales: 0,
          totalRevenue: 0,
          totalOrders: 0,
          averageTicket: 0
        },
        timeSeries: [
          {
            name: 'Ventas',
            data: Array.from({ length: 12 }, (_, i) => ({
              x: new Date().getTime() - (11 - i) * 24 * 60 * 60 * 1000,
              y: Math.floor(Math.random() * 100) + 50
            }))
          }
        ],
        categoryData: [
          { name: 'Sin datos', value: 1 }
        ],
        paymentData: [
          { name: 'Sin datos', value: 1 }
        ]
      };
    }

    const data = salesData.data;
    let totalSales = data.length;
    let totalRevenue = 0;
    let totalOrders = 0;
    let averageTicket = 0;

    // Datos para gráficos
    const categoryData = {};
    const paymentData = {};
    const dailySales = {};

    data.forEach(item => {
      const revenue = parseFloat(item.venta_total || 0);
      totalRevenue += revenue;
      totalOrders += parseInt(item.cantidad || 0);

      // Datos por categoría
      const category = item.categoria || 'Sin categoría';
      if (!categoryData[category]) {
        categoryData[category] = 0;
      }
      categoryData[category] += revenue;

      // Datos por método de pago
      const payment = item.venta_paymentMethod || 'No especificado';
      if (!paymentData[payment]) {
        paymentData[payment] = 0;
      }
      paymentData[payment] += revenue;

      // Datos por día para serie temporal
      const date = new Date(item.venta_timestamp || new Date()).toDateString();
      if (!dailySales[date]) {
        dailySales[date] = 0;
      }
      dailySales[date] += revenue;
    });

    averageTicket = totalRevenue / totalSales;

    // Convertir datos diarios a serie temporal
    const timeSeriesData = Object.entries(dailySales)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-30) // Últimos 30 días
      .map(([date, value]) => ({
        x: new Date(date).getTime(),
        y: value
      }));

    return {
      metrics: {
        totalSales,
        totalRevenue,
        totalOrders,
        averageTicket
      },
      timeSeries: [
        {
          name: 'Ventas Diarias',
          data: timeSeriesData.length > 0 ? timeSeriesData : [
            { x: new Date().getTime() - 24 * 60 * 60 * 1000, y: 100 },
            { x: new Date().getTime() - 12 * 60 * 60 * 1000, y: 150 },
            { x: new Date().getTime(), y: 200 }
          ]
        }
      ],
      categoryData: {
        categories: Object.keys(categoryData),
        series: [{
          name: 'Ventas por Categoría',
          data: Object.values(categoryData)
        }]
      },
      paymentData: {
        labels: Object.keys(paymentData),
        series: Object.values(paymentData)
      }
    };
  };

  const chartData = getProcessedData();

  if (loading) {
    return (
      <div className="dashboard-main-container">
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
          <div className="text-center">
            <Spinner animation="border" size="lg" className="mb-3 text-primary" />
            <h5 className="text-primary mb-2">Cargando dashboard...</h5>
            <p className="text-muted">Obteniendo datos en tiempo real</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-main-container">
      {/* Header del Dashboard */}
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Dashboard Analytics</h2>
          <p className="dashboard-date">Monitoreo en tiempo real</p>
        </div>
        <Button 
          variant="primary" 
          size="sm"
          onClick={loadDashboardData} 
          disabled={loading}
          className="px-3 py-2"
          title="Actualizar datos"
          style={{ minWidth: 'auto', width: 'auto' }}
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
          <DashboardMetrics 
            metrics={chartData.metrics}
          />

          {/* Gráficos principales en grid mejorado */}
          <div className="dashboard-charts-grid">
            <div className="chart-card large">
              <div className="chart-header">
                <h6 className="chart-title">Ventas en Tiempo Real</h6>
              </div>
              <div className="chart-content">
                <RealtimeLineChart 
                  data={chartData.timeSeries} 
                  title="" 
                />
              </div>
            </div>
            
            <div className="chart-card medium">
              <div className="chart-header">
                <h6 className="chart-title">Ventas por Categoría</h6>
              </div>
              <div className="chart-content">
                <MinimalBarChart 
                  data={chartData.categoryData} 
                  title="" 
                />
              </div>
            </div>
          </div>

          {/* Segunda fila de gráficos */}
          <div className="dashboard-charts-grid">
            <div className="chart-card medium">
              <div className="chart-header">
                <h6 className="chart-title">Métodos de Pago</h6>
              </div>
              <div className="chart-content">
                <MinimalDonutChart 
                  data={chartData.paymentData} 
                  title="" 
                />
              </div>
            </div>
            
            <div className="chart-card medium">
              <div className="chart-header">
                <h6 className="chart-title">Progreso Objetivo Mensual</h6>
              </div>
              <div className="chart-content">
                <ProgressAreaChart 
                  data={[{
                    name: 'Objetivo',
                    data: [65, 78, 85, 92]
                  }]} 
                  title=""
                  showLabels={true}
                />
              </div>
            </div>
            
            <div className="chart-card small">
              <div className="chart-header">
                <h6 className="chart-title">Tendencia de Inventario</h6>
              </div>
              <div className="chart-content">
                <div className="inventory-alert">
                  <FaBoxes className="text-warning" size={24} />
                  <span className="alert-text">7 productos con stock bajo</span>
                </div>
                <InventoryTrendChart 
                  data={[{
                    name: 'Stock Bajo',
                    data: [12, 8, 15, 6, 9, 11, 7]
                  }]} 
                  title=""
                />
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="dashboard-footer">
            <div className="update-info">
              <small className="text-muted">
                Última actualización: {lastUpdated ? lastUpdated.toLocaleString('es-MX') : 'Nunca'}
              </small>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;