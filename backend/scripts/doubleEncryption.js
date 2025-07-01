#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Sistema de doble encriptación AES para credenciales
 */
class DoubleEncryptionManager {
  constructor() {
    this.algorithm = 'aes-256-cbc';
    this.keyLength = 32;
    this.ivLength = 16;
  }

  /**
   * Genera una clave desde una contraseña
   */
  generateKey(password, salt = 'fisgo-monkey-tech-salt') {
    return crypto.scryptSync(password, salt, this.keyLength);
  }

  /**
   * Genera una contraseña aleatoria fuerte
   */
  generateRandomPassword(length = 64) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Encripta datos con AES
   */
  encrypt(data, password) {
    const key = this.generateKey(password);
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      iv: iv.toString('hex'),
      encrypted: encrypted,
      algorithm: this.algorithm
    };
  }

  /**
   * Desencripta datos con AES
   */
  decrypt(encryptedData, password) {
    const key = this.generateKey(password);
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Doble encriptación: credenciales + contraseña
   */
  doubleEncrypt(jsonData, masterPassword) {
    // Paso 1: Generar contraseña aleatoria
    const randomPassword = this.generateRandomPassword();
    
    // Paso 2: Encriptar credenciales con contraseña aleatoria
    const credentialsEncrypted = this.encrypt(JSON.stringify(jsonData, null, 2), randomPassword);
    
    // Paso 3: Encriptar contraseña aleatoria con clave maestra
    const passwordEncrypted = this.encrypt(randomPassword, masterPassword);
    
    return {
      credentials: credentialsEncrypted,
      password: passwordEncrypted,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
  }

  /**
   * Doble desencriptación
   */
  doubleDecrypt(doubleEncryptedData, masterPassword) {
    // Paso 1: Desencriptar contraseña aleatoria
    const randomPassword = this.decrypt(doubleEncryptedData.password, masterPassword);
    
    // Paso 2: Desencriptar credenciales con contraseña aleatoria
    const credentialsJson = this.decrypt(doubleEncryptedData.credentials, randomPassword);
    
    return JSON.parse(credentialsJson);
  }
}

/**
 * Script principal
 */
async function createDoubleEncryptedCredentials() {
  const manager = new DoubleEncryptionManager();
  
  // Rutas
  const inputFile = path.join(__dirname, '../config/google-service-account.json');
  const outputFile = path.join(__dirname, '../config/google-credentials.double-encrypted.json');
  
  // Clave maestra (se debe configurar en .env)
  const masterPassword = process.env.MASTER_ENCRYPTION_KEY || 'fisgo-monkey-tech-master-key-2025';
  
  try {
    // Leer credenciales originales
    if (!fs.existsSync(inputFile)) {
      throw new Error('Archivo de credenciales no encontrado');
    }
    
    const credentialsData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    
    // Doble encriptación
    const doubleEncrypted = manager.doubleEncrypt(credentialsData, masterPassword);
    
    // Guardar resultado
    fs.writeFileSync(outputFile, JSON.stringify(doubleEncrypted, null, 2));
    
    console.log('Doble encriptación completada');
    console.log('Archivo guardado:', outputFile);
    console.log('Clave maestra utilizada:', masterPassword);
    console.log('Timestamp:', doubleEncrypted.timestamp);
    
    return true;
    
  } catch (error) {
    console.error('Error en doble encriptación:', error.message);
    return false;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createDoubleEncryptedCredentials();
}

module.exports = { DoubleEncryptionManager, createDoubleEncryptedCredentials };
