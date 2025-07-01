#!/usr/bin/env node

const path = require('path');
const WalletCredentialsManager = require('../utils/walletCredentialsManager');

/**
 * Script para encriptar las credenciales de Google Firebase para la aplicación Wallet
 */
async function encryptWalletCredentials() {
  const credentialsManager = new WalletCredentialsManager();
  
  // Ruta base de la aplicación wallet
  const walletPath = path.join(__dirname, '..');
  
  // Contraseña de encriptación (puedes cambiarla)
  const password = process.env.WALLET_ENCRYPTION_PASSWORD || 'fisgo-wallet-2025-secure-key';
  
  console.log('Encriptando credenciales de Google Firebase para Wallet App...');
  console.log(`Ruta base: ${walletPath}`);
  console.log('');
  
  try {
    const results = credentialsManager.encryptMultipleGoogleServices(walletPath, password);
    
    let successCount = 0;
    let totalFiles = 0;
    
    results.forEach(result => {
      totalFiles++;
      if (result.success) {
        successCount++;
        console.log(`${result.path} - Encriptado exitosamente`);
      } else {
        if (result.reason === 'not_found') {
          console.log(`${result.path} - Archivo no encontrado`);
        } else {
          console.log(`${result.path} - Error durante encriptación`);
        }
      }
    });
    
    console.log('');
    console.log(`Resumen: ${successCount}/${totalFiles} archivos encriptados exitosamente`);
    
    if (successCount > 0) {
      console.log('');
      console.log('¡Credenciales de Wallet encriptadas exitosamente!');
      console.log('');
      console.log('INSTRUCCIONES:');
      console.log('1. Los archivos encriptados se pueden subir a GitHub de forma segura');
      console.log('2. Para usar en producción, configura la variable WALLET_ENCRYPTION_PASSWORD');
      console.log('3. El sistema desencriptará automáticamente las credenciales al compilar');
      console.log('');
      console.log('Contraseña utilizada:', password);
      console.log('Aplicación: FISGO Wallet');
      console.log('');
      console.log('IMPORTANTE:');
      console.log('- Los archivos originales google-services.json deben ser agregados al .gitignore');
      console.log('- Solo los archivos .encrypted.json deben ser subidos a GitHub');
    } else {
      console.log('No se pudieron encriptar las credenciales');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  encryptWalletCredentials();
}

module.exports = { encryptWalletCredentials };