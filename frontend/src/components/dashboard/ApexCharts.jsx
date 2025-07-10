// Archivo de compatibilidad - Re-exporta todos los componentes de gráficos desde la carpeta dashboard
// Este archivo mantiene la compatibilidad con importaciones existentes mientras organizamos mejor los componentes

export {
  RealtimeLineChart,
  ProgressAreaChart,
  InventoryTrendChart
} from './LineCharts';

export {
  MinimalBarChart,
  BarChart
} from './BarCharts';

export {
  MinimalDonutChart,
  PieChart
} from './PieCharts';
