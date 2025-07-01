#!/usr/bin/env node

const path = require('path');
const CredentialsManager = require('../utils/credentialsManager');

/**
 * Script para encriptar las credenciales de Google Cloud
 */
async function encryptCredentials() {
  const credentialsManager = new CredentialsManager();
  
  // Rutas de archivos
  const inputFile = path.join(__dirname, '../config/google-service-account.json');
  const outputFile = path.join(__dirname, '../config/google-credentials.encrypted.json');
  
  // Contraseña de encriptación (puedes cambiarla)
  const password = process.env.ENCRYPTION_PASSWORD || 'fisgo-2025-secure-key';
  
  console.log('Encriptando credenciales de Google Cloud...');
  console.log(`Archivo origen: ${inputFile}`);
  console.log(`Archivo destino: ${outputFile}`);
  
  try {
    const success = credentialsManager.encryptFile(inputFile, outputFile, password);
    
    if (success) {
      console.log('');
      console.log('¡Credenciales encriptadas exitosamente!');
      console.log('');
      console.log('INSTRUCCIONES:');
      console.log('1. El archivo encriptado se puede subir a GitHub de forma segura');
      console.log('2. Para usar en producción, configura la variable ENCRYPTION_PASSWORD');
      console.log('3. El sistema desencriptará automáticamente las credenciales');
      console.log('');
      console.log('Contraseña utilizada:', password);
      console.log('Archivo encriptado:', outputFile);
    } else {
      console.log('Error durante la encriptación');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  encryptCredentials();
}

module.exports = { encryptCredentials };