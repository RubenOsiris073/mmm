import React from 'react';
import { FaShoppingCart, FaDollarSign, FaBoxes, FaUsers, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const MetricCard = ({ icon: Icon, iconClass, value, label, change, changeType }) => (
  <div className="metric-card">
    <div className="metric-header">
      <div className={`metric-icon ${iconClass}`}>
        <Icon />
      </div>
      <div className="metric-content">
        <div className="metric-value">{value}</div>
        <div className="metric-label">{label}</div>
      </div>
    </div>
    <div className={`metric-change ${changeType}`}>
      {changeType === 'positive' ? <FaArrowUp className="me-1" /> : <FaArrowDown className="me-1" />}
      {change}
    </div>
  </div>
);

export const DashboardMetrics = ({ metrics }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

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
        value={formatCurrency(metrics?.totalRevenue || 0)}
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
        value={formatCurrency(metrics?.averageTicket || 0)}
        label="Ticket Promedio"
        change="-3%"
        changeType="negative"
      />
    </div>
  );
};
