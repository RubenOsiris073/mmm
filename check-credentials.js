const fs = require('fs');
const path = require('path');
const { DoubleEncryptionManager } = require('./backend/scripts/doubleEncryption');

// Leer las credenciales encriptadas
const encryptedFilePath = path.join(__dirname, 'backend/config/google-credentials.double-encrypted.json');
const doubleEncryptedData = JSON.parse(fs.readFileSync(encryptedFilePath, 'utf8'));

// Usar la clave maestra del .env
const masterPassword = 'fisgo-monkey-tech-master-key-2025'; // Desde el .env del backend

const doubleEncryption = new DoubleEncryptionManager();

try {
  const decryptedCredentials = doubleEncryption.doubleDecrypt(doubleEncryptedData, masterPassword);
  
  // Solo mostrar el project_id para verificar
  console.log('Project ID en las credenciales:', decryptedCredentials.project_id);
  console.log('Client Email:', decryptedCredentials.client_email);
  
} catch (error) {
  console.error('Error desencriptando:', error.message);
}
