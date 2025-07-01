#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const CredentialsManager = require('../utils/credentialsManager');

/**
 * Script para encriptar credenciales con contraseña aleatoria y dividir en partes
 */
function createEncryptedBackup() {
  try {
    // Generar contraseña aleatoria de 32 caracteres
    const randomPassword = crypto.randomBytes(16).toString('hex');
    
    const credentialsManager = new CredentialsManager();
    const inputFile = path.join(__dirname, '../config/google-service-account.json');
    const tempEncryptedFile = path.join(__dirname, '../config/temp-encrypted.json');
    
    console.log('Generando contraseña aleatoria...');
    console.log('Encriptando archivo con contraseña aleatoria...');
    
    // Encriptar el archivo
    const success = credentialsManager.encryptFile(inputFile, tempEncryptedFile, randomPassword);
    
    if (!success) {
      throw new Error('Error durante la encriptación');
    }
    
    // Leer el archivo encriptado y convertir a base64
    const encryptedData = fs.readFileSync(tempEncryptedFile, 'utf8');
    const encryptedBase64 = Buffer.from(encryptedData).toString('base64');
    
    // Dividir en 3 partes
    const totalLength = encryptedBase64.length;
    const part1Length = Math.floor(totalLength / 3);
    const part2Length = Math.floor(totalLength / 3);
    const part3Length = totalLength - part1Length - part2Length;
    
    const part1 = encryptedBase64.substring(0, part1Length);
    const part2 = encryptedBase64.substring(part1Length, part1Length + part2Length);
    const part3 = encryptedBase64.substring(part1Length + part2Length);
    
    // Crear directorio para partes
    const partsDir = path.join(__dirname, '../config/encrypted-parts');
    if (!fs.existsSync(partsDir)) {
      fs.mkdirSync(partsDir, { recursive: true });
    }
    
    // Guardar partes
    fs.writeFileSync(path.join(partsDir, 'part-alpha.txt'), part1);
    fs.writeFileSync(path.join(partsDir, 'part-beta.txt'), part2);
    fs.writeFileSync(path.join(partsDir, 'part-gamma.txt'), part3);
    
    // Guardar información de recuperación
    const recoveryInfo = `# Información de Recuperación
Fecha: ${new Date().toISOString()}
Contraseña: ${randomPassword}
Total base64: ${totalLength} chars
Partes: ${part1Length}, ${part2Length}, ${part3Length}

# Para recuperar:
# 1. Concatenar part-alpha.txt + part-beta.txt + part-gamma.txt
# 2. Decodificar desde base64 para obtener JSON encriptado
# 3. Usar CredentialsManager.decrypt() con la contraseña de arriba
`;
    
    fs.writeFileSync(path.join(__dirname, '../config/recovery-info.txt'), recoveryInfo);
    
    // Limpiar archivo temporal
    fs.unlinkSync(tempEncryptedFile);
    
    console.log('Backup encriptado creado exitosamente');
    console.log('');
    console.log('Archivos creados:');
    console.log(`  - encrypted-parts/part-alpha.txt (${part1Length} chars)`);
    console.log(`  - encrypted-parts/part-beta.txt (${part2Length} chars)`);
    console.log(`  - encrypted-parts/part-gamma.txt (${part3Length} chars)`);
    console.log(`  - recovery-info.txt (con contraseña)`);
    console.log('');
    console.log(`Contraseña aleatoria: ${randomPassword}`);
    console.log('');
    console.log('IMPORTANTE: Guarda cada parte en ubicaciones diferentes');
    
    return true;
    
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createEncryptedBackup();
}

module.exports = { createEncryptedBackup };
