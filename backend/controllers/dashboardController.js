const googleSheetsService = require('../services/googleSheetsService');
const Logger = require('../utils/logger.js');

const dashboardController = {
  async getMetrics(req, res) {
    try {
      const metrics = await googleSheetsService.getDashboardMetrics();
      
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      Logger.error('Error fetching dashboard metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener métricas del dashboard',
        error: error.message
      });
    }
  },

  async getSalesData(req, res) {
    try {
      const { range, limit = 25, offset = 0 } = req.query; // Límite más conservador
      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset);
      
      // Validar límites
      if (limitNum > 1000) {
        return res.status(400).json({
          success: false,
          message: 'Límite máximo de 1000 registros por consulta'
        });
      }
      
      const salesData = await googleSheetsService.getSalesData(range, limitNum, offsetNum);
      
      res.json({
        success: true,
        data: salesData,
        pagination: {
          limit: limitNum,
          offset: offsetNum,
          total: salesData.total
        }
      });
    } catch (error) {
      Logger.error('Error fetching sales data:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener datos de ventas',
        error: error.message
      });
    }
  }
};

module.exports = dashboardController;