const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const { DoubleEncryptionManager } = require('../scripts/doubleEncryption');
const Logger = require('../utils/logger.js');

class GoogleSheetsService {
  constructor() {
    this.sheets = null;
    this.spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    this.initialized = false;
    this.doubleEncryption = new DoubleEncryptionManager();
  }

  async initialize() {
    try {
      // Usar Service Account Key con múltiples métodos de configuración
      let auth;
      
      // Archivo con doble encriptación AES
      if (fs.existsSync(path.join(__dirname, '../config/google-credentials.double-encrypted.json'))) {
        Logger.info('Usando credenciales con doble encriptación AES');
        const encryptedFilePath = path.join(__dirname, '../config/google-credentials.double-encrypted.json');
        const masterPassword = process.env.MASTER_ENCRYPTION_KEY;
        
        try {
          const doubleEncryptedData = JSON.parse(fs.readFileSync(encryptedFilePath, 'utf8'));
          const credentials = this.doubleEncryption.doubleDecrypt(doubleEncryptedData, masterPassword);
          Logger.info('Credenciales desencriptadas exitosamente');
          
          auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
          });
        } catch (error) {
          Logger.error('Error desencriptando credenciales:', error.message);
          throw new Error('No se pudieron desencriptar las credenciales de Google');
        }
      }
      
      // Variable de entorno con ruta al archivo
      else if (process.env.GOOGLE_SERVICE_ACCOUNT_PATH) {
        Logger.info('Usando archivo de credenciales desde variable de entorno (GOOGLE_SERVICE_ACCOUNT_PATH)');
        auth = new google.auth.GoogleAuth({
          keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_PATH,
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
        });
      }
      
      // Método 4: Archivo local (fallback para desarrollo)
      else {
        Logger.info('Buscando archivo de credenciales local...');
        const possiblePaths = [
          './config/google-service-account.json',
          path.join(__dirname, '../config/google-service-account.json')
        ];
        
        let keyFile = null;
        for (const filePath of possiblePaths) {
          const fullPath = path.resolve(filePath);
          if (fs.existsSync(fullPath)) {
            keyFile = fullPath;
            Logger.info(`Encontrado archivo local: ${keyFile}`);
            break;
          }
        }
        
        if (!keyFile) {
          throw new Error('No se encontraron credenciales de Google. Configura ENCRYPTION_PASSWORD o coloca el archivo encriptado');
        }
        
        auth = new google.auth.GoogleAuth({
          keyFile: keyFile,
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
        });
      }

      this.sheets = google.sheets({ version: 'v4', auth });
      this.initialized = true;
      Logger.info('Google Sheets service initialized successfully');
    } catch (error) {
      Logger.error('Error initializing Google Sheets service:', error);
      throw error;
    }
  }

  async getSalesData(range = 'A:Z', limit = 100000, offset = 0) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Si no se especifica una hoja, usar la primera hoja disponible
      let finalRange = range;
      if (!range.includes('!')) {
        // Obtener información del spreadsheet para conocer las hojas disponibles
        const spreadsheetInfo = await this.sheets.spreadsheets.get({
          spreadsheetId: this.spreadsheetId,
        });
        
        if (spreadsheetInfo.data.sheets && spreadsheetInfo.data.sheets.length > 0) {
          const firstSheetName = spreadsheetInfo.data.sheets[0].properties.title;
          finalRange = `${firstSheetName}!${range}`;
          Logger.info(`Usando hoja: ${firstSheetName}`);
        }
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: finalRange,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return { data: [], headers: [], total: 0 };
      }

      // Primera fila son los headers
      const headers = rows[0];
      const dataRows = rows.slice(1);
      const total = dataRows.length;
      
      // Aplicar paginación
      const startIndex = offset;
      const endIndex = offset + limit;
      const paginatedRows = dataRows.slice(startIndex, endIndex);
      
      const data = paginatedRows.map(row => {
        const item = {};
        headers.forEach((header, index) => {
          item[header] = row[index] || '';
        });
        return item;
      });

      Logger.info(`Retornando ${data.length} de ${total} registros (offset: ${offset}, limit: ${limit})`);
      return { data, headers, total };
    } catch (error) {
      Logger.error('Error fetching sales data from Google Sheets:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los datos paginando automáticamente en bloques
   * @param {Object} options
   * @param {string} [options.range]
   * @param {number} [options.limit]
   * @returns {Promise<{data: Array, headers: Array, total: number}>}
   */
  async getAllSalesDataPaginated({ range = 'A:Z', limit = 10000 } = {}) {
    if (!this.initialized) {
      await this.initialize();
    }
    let allData = [];
    let headers = [];
    let total = 0;
    let offset = 0;
    let done = false;
    while (!done) {
      Logger.info(`[Paginación GoogleSheets] limit: ${limit}, offset: ${offset}`);
      const { data, headers: hdrs, total: blockTotal } = await this.getSalesData(range, limit, offset);
      if (headers.length === 0 && hdrs.length > 0) headers = hdrs;
      if (blockTotal === 0 || data.length === 0) break;
      allData = allData.concat(data);
      total = blockTotal;
      offset += limit;
      if (data.length < limit) done = true;
    }
    return { data: allData, headers, total };
  }

  async getDashboardMetrics({ limit = 100000, offset = 0, range = 'A:Z' } = {}) {
    try {
      // Permitir ajustar el rango, limit y offset desde el frontend
      const salesData = await this.getSalesData(range, limit, offset);
      const metrics = {
        totalSales: salesData.total,
        totalRevenue: salesData.data.reduce((sum, sale) => {
          const amount = parseFloat(sale.Total || sale.Monto || sale.Importe || 0);
          return sum + amount;
        }, 0),
        salesByMonth: this.groupSalesByMonth(salesData.data),
        topProducts: this.getTopProducts(salesData.data),
        lastUpdated: new Date().toISOString(),
        note: `Métricas calculadas con los últimos ${salesData.data.length} registros de ${salesData.total} totales (limit: ${limit}, offset: ${offset})`
      };
      return metrics;
    } catch (error) {
      Logger.error('Error calculating dashboard metrics:', error);
      throw error;
    }
  }

  groupSalesByMonth(salesData) {
    const grouped = {};
    
    salesData.forEach(sale => {
      // Buscar campo de fecha (puede variar el nombre)
      const dateField = sale.Fecha || sale.Date || sale.fecha || sale.timestamp;
      if (dateField) {
        const date = new Date(dateField);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!grouped[monthKey]) {
          grouped[monthKey] = { count: 0, revenue: 0 };
        }
        
        grouped[monthKey].count++;
        const amount = parseFloat(sale.Total || sale.Monto || sale.Importe || 0);
        grouped[monthKey].revenue += amount;
      }
    });

    return grouped;
  }

  getTopProducts(salesData) {
    const productCount = {};
    
    salesData.forEach(sale => {
      const product = sale.Producto || sale.Product || sale.producto || sale.item;
      if (product) {
        productCount[product] = (productCount[product] || 0) + 1;
      }
    });

    return Object.entries(productCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([product, count]) => ({ product, count }));
  }
}

module.exports = new GoogleSheetsService();