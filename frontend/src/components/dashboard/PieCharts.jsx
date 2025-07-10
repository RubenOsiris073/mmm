import React from 'react';
import Chart from 'react-apexcharts';

// Gráfico de donut minimalista
export const MinimalDonutChart = ({ data, title }) => {
  // Procesar datos para el formato correcto
  const processedData = data && data.length > 0 ? data : [
    { name: 'Efectivo', value: 45 },
    { name: 'Tarjeta', value: 35 },
    { name: 'Transferencia', value: 20 }
  ];

  const options = {
    chart: {
      type: 'donut',
      background: 'transparent'
    },
    colors: ['#00E396', '#0090FF', '#FEB019', '#FF4560', '#775DD0'],
    labels: processedData.map(item => item.name),
    dataLabels: {
      enabled: false
    },
    legend: {
      show: true,
      position: 'bottom',
      labels: {
        colors: '#8e8da4'
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '16px',
              color: '#8e8da4'
            },
            value: {
              show: true,
              fontSize: '20px',
              color: '#ffffff',
              formatter: function (val) {
                return parseInt(val) + '%';
              }
            },
            total: {
              show: true,
              label: 'Total',
              color: '#8e8da4',
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => {
                  return a + b;
                }, 0) + '%';
              }
            }
          }
        }
      }
    },
    tooltip: {
      theme: 'dark'
    }
  };

  const series = processedData.map(item => item.value);

  return (
    <div className="apex-chart-container">
      <div className="chart-header">
        <h6 className="chart-title">{title}</h6>
      </div>
      <Chart
        options={options}
        series={series}
        type="donut"
        height={300}
      />
    </div>
  );
};

// Gráfico de pastel avanzado
export const PieChart = ({ data, title, height = 300 }) => {
  const processedData = data && data.length > 0 ? data : [
    { label: 'Categoria A', value: 15000 },
    { label: 'Categoria B', value: 8500 },
    { label: 'Categoria C', value: 12000 }
  ];

  const options = {
    chart: {
      type: 'pie',
      height: height,
      background: 'transparent'
    },
    labels: processedData.map(item => item.label),
    colors: ['#0d6efd', '#198754', '#dc3545', '#ffc107', '#6f42c1', '#fd7e14', '#20c997', '#6c757d', '#e83e8c', '#17a2b8'],
    dataLabels: {
      enabled: true,
      formatter: function(val, opts) {
        const value = processedData[opts.seriesIndex].value;
        return new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          notation: 'compact'
        }).format(value);
      },
      style: {
        fontSize: '12px'
      }
    },
    legend: {
      position: 'bottom',
      fontSize: '12px',
      labels: {
        colors: '#8e8da4'
      }
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
          }).format(val);
        }
      },
      theme: 'dark'
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  const series = processedData.map(item => item.value);

  return (
    <div className="apex-chart-container">
      {title && (
        <div className="chart-header">
          <h6 className="chart-title">{title}</h6>
        </div>
      )}
      <Chart
        options={options}
        series={series}
        type="pie"
        height={height}
      />
    </div>
  );
};
