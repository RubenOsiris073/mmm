const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const { DoubleEncryptionManager } = require('../scripts/doubleEncryption');

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
      
      // Método 1: Archivo con doble encriptación AES
      if (fs.existsSync(path.join(__dirname, '../config/google-credentials.double-encrypted.json'))) {
        console.log('Usando credenciales con doble encriptación AES');
        const encryptedFilePath = path.join(__dirname, '../config/google-credentials.double-encrypted.json');
        const masterPassword = process.env.MASTER_ENCRYPTION_KEY;
        
        try {
          const doubleEncryptedData = JSON.parse(fs.readFileSync(encryptedFilePath, 'utf8'));
          const credentials = this.doubleEncryption.doubleDecrypt(doubleEncryptedData, masterPassword);
          console.log('Credenciales desencriptadas exitosamente');
          
          auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
          });
        } catch (error) {
          console.error('Error desencriptando credenciales:', error.message);
          throw new Error('No se pudieron desencriptar las credenciales de Google');
        }
      }
      
      // Método 2: Archivo encriptado simple (FALLBACK)
      else if (fs.existsSync(path.join(__dirname, '../config/google-credentials.encrypted.json'))) {
        console.log('Usando credenciales encriptadas desde archivo local');
        const CredentialsManager = require('../utils/credentialsManager');
        const credentialsManager = new CredentialsManager();
        const encryptedFilePath = path.join(__dirname, '../config/google-credentials.encrypted.json');
        const password = process.env.ENCRYPTION_PASSWORD;
        
        try {
          const credentials = credentialsManager.getDecryptedCredentials(encryptedFilePath, password);
          console.log('Credenciales desencriptadas exitosamente');
          
          auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
          });
        } catch (error) {
          console.error('Error desencriptando credenciales:', error.message);
          throw new Error('No se pudieron desencriptar las credenciales de Google');
        }
      }
      
      // Método 3: Variable de entorno con ruta al archivo
      else if (process.env.GOOGLE_SERVICE_ACCOUNT_PATH) {
        console.log('Usando archivo de credenciales desde variable de entorno (GOOGLE_SERVICE_ACCOUNT_PATH)');
        auth = new google.auth.GoogleAuth({
          keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_PATH,
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
        });
      }
      
      // Método 4: Archivo local (fallback para desarrollo)
      else {
        console.log('Buscando archivo de credenciales local...');
        const possiblePaths = [
          './config/google-service-account.json',
          path.join(__dirname, '../config/google-service-account.json')
        ];
        
        let keyFile = null;
        for (const filePath of possiblePaths) {
          const fullPath = path.resolve(filePath);
          if (fs.existsSync(fullPath)) {
            keyFile = fullPath;
            console.log(`Encontrado archivo local: ${keyFile}`);
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
      console.log('Google Sheets service initialized successfully');
    } catch (error) {
      console.error('Error initializing Google Sheets service:', error);
      throw error;
    }
  }

  async getSalesData(range = 'A:Z', limit = 100, offset = 0) {
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

      console.log(`Retornando ${data.length} de ${total} registros (offset: ${offset}, limit: ${limit})`);
      return { data, headers, total };
    } catch (error) {
      console.error('Error fetching sales data from Google Sheets:', error);
      throw error;
    }
  }

  async getDashboardMetrics() {
    try {
      // Para las métricas necesitamos todos los datos, pero podemos optimizar obteniendo solo los últimos 1000
      const salesData = await this.getSalesData('A:Z', 1000, 0);
      
      // Procesar datos para métricas del dashboard
      const metrics = {
        totalSales: salesData.total, // Usar el total real de registros
        totalRevenue: salesData.data.reduce((sum, sale) => {
          const amount = parseFloat(sale.Total || sale.Monto || sale.Importe || 0);
          return sum + amount;
        }, 0),
        salesByMonth: this.groupSalesByMonth(salesData.data),
        topProducts: this.getTopProducts(salesData.data),
        lastUpdated: new Date().toISOString(),
        note: `Métricas calculadas con los últimos ${salesData.data.length} registros de ${salesData.total} totales`
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