#!/usr/bin/env node

const path = require('path');
const WalletCredentialsManager = require('../utils/walletCredentialsManager');

/**
 * Script para desencriptar las credenciales de Google Firebase para la aplicación Wallet
 */
async function decryptWalletCredentials() {
  const credentialsManager = new WalletCredentialsManager();
  
  // Ruta base de la aplicación wallet
  const walletPath = path.join(__dirname, '..');
  
  // Contraseña de desencriptación desde variable de entorno
  const password = process.env.WALLET_ENCRYPTION_PASSWORD || 'fisgo-wallet-2025-secure-key';
  
  console.log('🔓 Desencriptando credenciales de Google Firebase para Wallet App...');
  console.log(`📂 Ruta base: ${walletPath}`);
  console.log('');
  
  try {
    const results = credentialsManager.decryptMultipleGoogleServices(walletPath, password);
    
    let successCount = 0;
    let totalFiles = 0;
    
    results.forEach(result => {
      totalFiles++;
      if (result.success) {
        successCount++;
        console.log(`✅ ${result.path} - Desencriptado exitosamente`);
      } else {
        if (result.reason === 'not_found') {
          console.log(`⚠️  ${result.path} - Archivo encriptado no encontrado`);
        } else {
          console.log(`❌ ${result.path} - Error durante desencriptación`);
        }
      }
    });
    
    console.log('');
    console.log(`📊 Resumen: ${successCount}/${totalFiles} archivos desencriptados exitosamente`);
    
    if (successCount > 0) {
      console.log('');
      console.log('✅ ¡Credenciales de Wallet desencriptadas exitosamente!');
      console.log('');
      console.log('📋 INSTRUCCIONES:');
      console.log('1. Los archivos google-services.json están listos para usar');
      console.log('2. Puedes compilar la aplicación normalmente');
      console.log('3. Los archivos se crearon automáticamente en las ubicaciones correctas');
      console.log('');
      console.log('⚠️  IMPORTANTE: No subas los archivos desencriptados a GitHub');
      console.log('🔑 Contraseña utilizada:', password);
      console.log('📱 Aplicación: FISGO Wallet');
    } else {
      console.log('❌ No se pudieron desencriptar las credenciales');
      console.log('💡 Verifica que los archivos .encrypted.json existan y la contraseña sea correcta');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  decryptWalletCredentials();
}

module.exports = { decryptWalletCredentials };