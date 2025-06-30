const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

class GoogleSheetsService {
  constructor() {
    this.sheets = null;
    this.spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Usar Service Account Key con múltiples métodos de configuración
      let auth;
      
      // Método 1: Variable de entorno con credenciales completas en Base64
      if (process.env.GOOGLE_SERVICE_ACCOUNT_BASE64) {
        console.log('📋 Usando credenciales desde variable de entorno (GOOGLE_SERVICE_ACCOUNT_BASE64)');
        const credentialsBuffer = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_BASE64, 'base64');
        const credentials = JSON.parse(credentialsBuffer.toString('utf8'));
        
        auth = new google.auth.GoogleAuth({
          credentials: credentials,
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
        });
      }
      
      // Método 2: Variable de entorno con ruta al archivo
      else if (process.env.GOOGLE_SERVICE_ACCOUNT_PATH) {
        console.log('📁 Usando archivo de credenciales desde variable de entorno (GOOGLE_SERVICE_ACCOUNT_PATH)');
        auth = new google.auth.GoogleAuth({
          keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_PATH,
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
        });
      }
      
      // Método 3: Archivo local (fallback para desarrollo)
      else {
        console.log('🔍 Buscando archivo de credenciales local...');
        const possiblePaths = [
          './config/google-service-account.json',
          './scripts/config/google-service-account.json',
          path.join(__dirname, '../config/google-service-account.json'),
          path.join(__dirname, '../scripts/config/google-service-account.json')
        ];
        
        let keyFile = null;
        for (const filePath of possiblePaths) {
          const fullPath = path.resolve(filePath);
          if (fs.existsSync(fullPath)) {
            keyFile = fullPath;
            console.log(`📄 Encontrado archivo local: ${keyFile}`);
            break;
          }
        }
        
        if (!keyFile) {
          throw new Error('No se encontraron credenciales de Google. Configura GOOGLE_SERVICE_ACCOUNT_BASE64 o GOOGLE_SERVICE_ACCOUNT_PATH');
        }
        
        auth = new google.auth.GoogleAuth({
          keyFile: keyFile,
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
        });
      }

      this.sheets = google.sheets({ version: 'v4', auth });
      this.initialized = true;
      console.log('✅ Google Sheets service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Google Sheets service:', error);
      throw error;
    }
  }

  async getSalesData(range = 'A:Z') {
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
          console.log(`Usando hoja: ${firstSheetName}`);
        }
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: finalRange,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return { data: [], headers: [] };
      }

      // Primera fila son los headers
      const headers = rows[0];
      const data = rows.slice(1).map(row => {
        const item = {};
        headers.forEach((header, index) => {
          item[header] = row[index] || '';
        });
        return item;
      });

      return { data, headers };
    } catch (error) {
      console.error('Error fetching sales data from Google Sheets:', error);
      throw error;
    }
  }

  async getDashboardMetrics() {
    try {
      const salesData = await this.getSalesData();
      
      // Procesar datos para métricas del dashboard
      const metrics = {
        totalSales: salesData.data.length,
        totalRevenue: salesData.data.reduce((sum, sale) => {
          const amount = parseFloat(sale.Total || sale.Monto || sale.Importe || 0);
          return sum + amount;
        }, 0),
        salesByMonth: this.groupSalesByMonth(salesData.data),
        topProducts: this.getTopProducts(salesData.data),
        lastUpdated: new Date().toISOString()
      };

      return metrics;
    } catch (error) {
      console.error('Error calculating dashboard metrics:', error);
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