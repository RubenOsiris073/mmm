import React from 'react';
import { FaShoppingCart, FaDollarSign, FaBoxes, FaUsers, FaArrowUp, FaArrowDown, FaClock, FaBullseye } from 'react-icons/fa';

const MetricCard = ({ icon: Icon, iconClass, value, label, change, changeType }) => (
  <div className="metric-card">
    <div className="metric-main">
      <div className="metric-left">
        <div className={`metric-icon ${iconClass}`}>
          <Icon />
        </div>
        <div className="metric-content">
          <div className="metric-value">{value}</div>
          <div className="metric-label">{label}</div>
        </div>
      </div>
      <div className={`metric-change-right ${changeType}`}>
        {changeType === 'positive' ? <FaArrowUp className="change-icon" /> : <FaArrowDown className="change-icon" />}
        <span className="change-value">{change}</span>
      </div>
    </div>
  </div>
);

export const DashboardMetrics = ({ metrics, formatCurrency }) => {
  // Función de fallback si no se pasa formatCurrency como prop
  const defaultFormatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  const currencyFormatter = formatCurrency || defaultFormatCurrency;

  return (
    <div className="dashboard-metrics">
      <MetricCard
        icon={FaShoppingCart}
        iconClass="sales"
        value={metrics?.totalSales || 0}
        label="Total Ventas"
        change="+12%"
        changeType="positive"
      />
      <MetricCard
        icon={FaDollarSign}
        iconClass="revenue"
        value={currencyFormatter(metrics?.totalRevenue || 0)}
        label="Ingresos"
        change="+8%"
        changeType="positive"
      />
      <MetricCard
        icon={FaBoxes}
        iconClass="orders"
        value={metrics?.totalOrders || 0}
        label="Órdenes"
        change="+15%"
        changeType="positive"
      />
      <MetricCard
        icon={FaUsers}
        iconClass="users"
        value={currencyFormatter(metrics?.averageTicket || 0)}
        label="Ticket Promedio"
        change="-3%"
        changeType="negative"
      />
      <MetricCard
        icon={FaClock}
        iconClass="today"
        value={metrics?.todaySales || 0}
        label="Ventas Hoy"
        change="+5%"
        changeType="positive"
      />
      <MetricCard
        icon={FaBullseye}
        iconClass="target"
        value="68%"
        label="Meta Mensual"
        change="+2%"
        changeType="positive"
      />
    </div>
  );
};
