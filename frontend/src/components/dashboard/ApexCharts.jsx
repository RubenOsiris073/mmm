import React from 'react';
import Chart from 'react-apexcharts';

// Gráfico de líneas minimalista para ventas en tiempo real
export const RealtimeLineChart = ({ data, title }) => {
  const options = {
    chart: {
      id: 'realtime-line',
      type: 'line',
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: {
          speed: 1000
        }
      },
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      },
      background: 'transparent'
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    colors: ['#00E396', '#FEB019'],
    markers: {
      size: 0
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: '#8e8da4',
          fontSize: '12px'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#8e8da4',
          fontSize: '12px'
        }
      }
    },
    legend: {
      show: false
    },
    grid: {
      show: true,
      borderColor: '#40475D',
      strokeDashArray: 0,
      position: 'back',
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    tooltip: {
      enabled: true,
      theme: 'dark'
    }
  };

  const series = data || [
    {
      name: 'Ventas',
      data: []
    }
  ];

  return (
    <div className="apex-chart-container">
      <div className="chart-header">
        <h6 className="chart-title">{title}</h6>
      </div>
      <Chart
        options={options}
        series={series}
        type="line"
        height={300}
      />
    </div>
  );
};

// Gráfico de barras minimalista
export const MinimalBarChart = ({ data, title }) => {
  const options = {
    chart: {
      type: 'bar',
      toolbar: {
        show: false
      },
      background: 'transparent'
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded',
        borderRadius: 4
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    colors: ['#546E7A', '#26A69A', '#FF7043', '#AB47BC'],
    xaxis: {
      categories: data?.categories || [],
      labels: {
        style: {
          colors: '#8e8da4',
          fontSize: '12px'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#8e8da4',
          fontSize: '12px'
        }
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return '$' + val.toLocaleString();
        }
      },
      theme: 'dark'
    },
    legend: {
      show: false
    },
    grid: {
      show: true,
      borderColor: '#40475D',
      strokeDashArray: 0,
      position: 'back',
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    }
  };

  const series = data?.series || [];

  return (
    <div className="apex-chart-container">
      <div className="chart-header">
        <h6 className="chart-title">{title}</h6>
      </div>
      <Chart
        options={options}
        series={series}
        type="bar"
        height={300}
      />
    </div>
  );
};

// Gráfico de donut minimalista
export const MinimalDonutChart = ({ data, title }) => {
  const options = {
    chart: {
      type: 'donut',
      background: 'transparent'
    },
    colors: ['#00E396', '#0090FF', '#FEB019', '#FF4560', '#775DD0'],
    labels: data?.labels || [],
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

  const series = data?.series || [];

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

// Gráfico de área para progreso con labels
export const ProgressAreaChart = ({ data, title, showLabels = false }) => {
  const options = {
    chart: {
      type: 'area',
      sparkline: {
        enabled: !showLabels
      },
      background: 'transparent',
      toolbar: {
        show: false
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      }
    },
    colors: ['#00E396'],
    tooltip: {
      enabled: true,
      theme: 'dark',
      y: {
        formatter: function (val) {
          return val + '%';
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: showLabels ? {
      categories: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
      labels: {
        style: {
          colors: '#8e8da4',
          fontSize: '10px'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    } : {},
    yaxis: showLabels ? {
      labels: {
        style: {
          colors: '#8e8da4',
          fontSize: '10px'
        },
        formatter: function (val) {
          return val + '%';
        }
      },
      min: 0,
      max: 100
    } : {},
    grid: showLabels ? {
      show: true,
      borderColor: '#40475D',
      strokeDashArray: 0,
      position: 'back',
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    } : { show: false }
  };

  const series = data || [
    {
      name: 'Progreso',
      data: [20, 40, 60, 80]
    }
  ];

  return (
    <div className={`apex-chart-container ${showLabels ? '' : 'small'}`}>
      <div className="chart-header">
        <h6 className="chart-title">{title}</h6>
      </div>
      <Chart
        options={options}
        series={series}
        type="area"
        height={showLabels ? 200 : 120}
      />
    </div>
  );
};

// Gráfico de tendencia de inventario
export const InventoryTrendChart = ({ data, title }) => {
  const options = {
    chart: {
      type: 'line',
      sparkline: {
        enabled: true
      },
      background: 'transparent'
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    colors: ['#FF6B6B'],
    tooltip: {
      enabled: true,
      theme: 'dark',
      y: {
        formatter: function (val) {
          return val + ' productos';
        }
      }
    },
    markers: {
      size: 4,
      colors: ['#FF6B6B'],
      strokeColors: '#fff',
      strokeWidth: 2
    }
  };

  const series = data || [
    {
      name: 'Stock Bajo',
      data: [12, 8, 15, 6, 9, 11, 7]
    }
  ];

  return (
    <div className="apex-chart-container small">
      <div className="chart-header">
        <h6 className="chart-title">{title}</h6>
        <div className="chart-subtitle">
          <span className="text-warning">⚠️ {series[0]?.data[series[0]?.data.length - 1] || 0} productos con stock bajo</span>
        </div>
      </div>
      <Chart
        options={options}
        series={series}
        type="line"
        height={120}
      />
    </div>
  );
};
