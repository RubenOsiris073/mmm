import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Colores predefinidos para las gráficas
const CHART_COLORS = [
  '#0d6efd', '#198754', '#dc3545', '#ffc107', '#6f42c1', 
  '#fd7e14', '#20c997', '#6c757d', '#e83e8c', '#17a2b8'
];

// Componente para gráfica de barras
export const BarChart = ({ data, title, height = 300 }) => {
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: 'Ingresos',
        data: data.map(item => item.value),
        backgroundColor: CHART_COLORS.slice(0, data.length),
        borderColor: CHART_COLORS.slice(0, data.length),
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
        color: '#495057',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN'
            }).format(context.parsed.y);
            return `${context.label}: ${value}`;
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#dee2e6',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN',
              notation: 'compact'
            }).format(value);
          },
          color: '#6c757d',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#6c757d',
          maxRotation: 45,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

// Componente para gráfica de pastel
export const PieChart = ({ data, title, height = 300 }) => {
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: CHART_COLORS.slice(0, data.length),
        borderColor: '#fff',
        borderWidth: 3,
        hoverBorderWidth: 5,
        hoverOffset: 15, // Mayor separación al hacer hover
        hoverBorderColor: '#ffffff',
        hoverBackgroundColor: CHART_COLORS.slice(0, data.length).map(color => 
          // Hacer los colores más brillantes en hover
          color.replace(')', ', 0.9)').replace('rgb', 'rgba').replace('#', 'rgba(') + '80, 80, 80, 0.9)'
        ),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 2000, // Animación más larga
      easing: 'easeOutBounce', // Efecto bounce
    },
    interaction: {
      intersect: false,
      mode: 'point',
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 25,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 13,
            weight: 'bold',
          },
          color: '#495057',
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const percentage = ((value / total) * 100).toFixed(1);
                const formattedValue = new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                  notation: 'compact'
                }).format(value);
                return {
                  text: `${label} (${percentage}%) - ${formattedValue}`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor,
                  lineWidth: data.datasets[0].borderWidth,
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        },
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 18,
          weight: 'bold',
        },
        color: '#495057',
        padding: {
          bottom: 25,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#ffffff',
        borderWidth: 2,
        cornerRadius: 10,
        displayColors: true,
        bodyFont: {
          size: 14,
          weight: 'bold',
        },
        titleFont: {
          size: 16,
          weight: 'bold',
        },
        callbacks: {
          title: function(context) {
            return `📊 ${context[0].label}`;
          },
          label: function(context) {
            const value = new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN'
            }).format(context.parsed);
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return [
              `💰 Ingresos: ${value}`,
              `📈 Porcentaje: ${percentage}%`
            ];
          },
          afterLabel: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const remaining = total - context.parsed;
            const remainingFormatted = new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN',
              notation: 'compact'
            }).format(remaining);
            return `💼 Resto: ${remainingFormatted}`;
          }
        },
      },
    },
    elements: {
      arc: {
        borderJoinStyle: 'round',
      }
    },
    // Efectos de hover mejorados
    onHover: (event, activeElements) => {
      event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
    },
  };

  return (
    <div style={{ height: `${height}px`, position: 'relative' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
};

// Componente para gráfica de barras horizontales (para rankings)
export const HorizontalBarChart = ({ data, title, height = 300 }) => {
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: 'Cantidad',
        data: data.map(item => item.value),
        backgroundColor: CHART_COLORS.slice(0, data.length),
        borderColor: CHART_COLORS.slice(0, data.length),
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
        color: '#495057',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed.x}`;
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#dee2e6',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: '#6c757d',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        ticks: {
          color: '#6c757d',
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};