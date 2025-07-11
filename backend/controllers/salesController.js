const salesService = require('../services/salesService');

// GET /api/sales/paginated
async function getSalesPaginatedController(req, res) {
  try {
    const { limit = 50, startAfter } = req.query;
    const sales = await salesService.getSalesPaginated({
      limit: parseInt(limit, 10),
      startAfter
    });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /api/sales/cached
async function getCachedSalesController(req, res) {
  try {
    const { limit = 50 } = req.query;
    const sales = await salesService.getCachedSales(parseInt(limit, 10));
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getSalesPaginatedController,
  getCachedSalesController
};
