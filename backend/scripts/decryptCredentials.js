#!/usr/bin/env node

const path = require('path');
const CredentialsManager = require('../utils/credentialsManager');

/**
 * Script para desencriptar las credenciales de Google Cloud en producción
 */
async function decryptCredentials() {
  const credentialsManager = new CredentialsManager();
  
  // Rutas de archivos
  const encryptedFile = path.join(__dirname, '../config/google-credentials.encrypted.json');
  const outputFile = path.join(__dirname, '../config/google-service-account.json');
  
  // Contraseña de desencriptación desde variable de entorno
  const password = process.env.ENCRYPTION_PASSWORD || 'mmm-aguachile-2025-secure-key';
  
  console.log('🔓 Desencriptando credenciales de Google Cloud...');
  console.log(`📂 Archivo encriptado: ${encryptedFile}`);
  console.log(`📂 Archivo destino: ${outputFile}`);
  
  try {
    const success = credentialsManager.decryptFile(encryptedFile, outputFile, password);
    
    if (success) {
      console.log('');
      console.log('✅ ¡Credenciales desencriptadas exitosamente!');
      console.log('');
      console.log('📋 INSTRUCCIONES:');
      console.log('1. Las credenciales están listas para usar');
      console.log('2. El archivo se creó automáticamente en:', outputFile);
      console.log('3. El sistema puede usar ahora las credenciales desencriptadas');
      console.log('');
      console.log('⚠️  IMPORTANTE: No subas el archivo desencriptado a GitHub');
      console.log('🔑 Contraseña utilizada:', password);
    } else {
      console.log('❌ Error durante la desencriptación');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  decryptCredentials();
}

module.exports = { decryptCredentials };