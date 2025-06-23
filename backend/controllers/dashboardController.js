const googleSheetsService = require('../services/googleSheetsService');

const dashboardController = {
  async getMetrics(req, res) {
    try {
      const metrics = await googleSheetsService.getDashboardMetrics();
      
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener métricas del dashboard',
        error: error.message
      });
    }
  },

  async getSalesData(req, res) {
    try {
      const { range } = req.query;
      const salesData = await googleSheetsService.getSalesData(range);
      
      res.json({
        success: true,
        data: salesData
      });
    } catch (error) {
      console.error('Error fetching sales data:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener datos de ventas',
        error: error.message
      });
    }
  }
};

module.exports = dashboardController;