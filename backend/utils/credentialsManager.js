const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Sistema de encriptación/desencriptación para credenciales de Google Cloud
 */
class CredentialsManager {
  constructor() {
    // Algoritmo de encriptación
    this.algorithm = 'aes-256-cbc';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16;  // 128 bits
  }

  /**
   * Genera una clave de encriptación desde una contraseña
   */
  generateKey(password) {
    return crypto.scryptSync(password, 'salt-mmm-aguachile', this.keyLength);
  }

  /**
   * Encripta un objeto JSON
   */
  encrypt(data, password) {
    try {
      const key = this.generateKey(password);
      const iv = crypto.randomBytes(this.ivLength);
      
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      
      const jsonString = JSON.stringify(data, null, 2);
      
      let encrypted = cipher.update(jsonString, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const result = {
        iv: iv.toString('hex'),
        encrypted: encrypted,
        algorithm: this.algorithm,
        timestamp: new Date().toISOString()
      };
      
      return result;
    } catch (error) {
      throw new Error(`Error encriptando credenciales: ${error.message}`);
    }
  }

  /**
   * Desencripta un objeto JSON
   */
  decrypt(encryptedData, password) {
    try {
      const key = this.generateKey(password);
      const iv = Buffer.from(encryptedData.iv, 'hex');
      
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      throw new Error(`Error desencriptando credenciales: ${error.message}`);
    }
  }

  /**
   * Encripta un archivo JSON y guarda el resultado encriptado
   */
  encryptFile(inputPath, outputPath, password) {
    try {
      if (!fs.existsSync(inputPath)) {
        throw new Error(`Archivo no encontrado: ${inputPath}`);
      }

      const rawData = fs.readFileSync(inputPath, 'utf8');
      const jsonData = JSON.parse(rawData);
      
      const encrypted = this.encrypt(jsonData, password);
      
      fs.writeFileSync(outputPath, JSON.stringify(encrypted, null, 2));
      
      console.log(`✅ Archivo encriptado guardado en: ${outputPath}`);
      return true;
    } catch (error) {
      console.error(`❌ Error encriptando archivo: ${error.message}`);
      return false;
    }
  }

  /**
   * Desencripta un archivo y guarda el JSON original
   */
  decryptFile(inputPath, outputPath, password) {
    try {
      if (!fs.existsSync(inputPath)) {
        throw new Error(`Archivo encriptado no encontrado: ${inputPath}`);
      }

      const encryptedData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
      const decrypted = this.decrypt(encryptedData, password);
      
      fs.writeFileSync(outputPath, JSON.stringify(decrypted, null, 2));
      
      console.log(`✅ Archivo desencriptado guardado en: ${outputPath}`);
      return true;
    } catch (error) {
      console.error(`❌ Error desencriptando archivo: ${error.message}`);
      return false;
    }
  }

  /**
   * Obtiene credenciales desencriptadas en memoria (sin guardar archivo)
   */
  getDecryptedCredentials(encryptedFilePath, password) {
    try {
      if (!fs.existsSync(encryptedFilePath)) {
        throw new Error(`Archivo encriptado no encontrado: ${encryptedFilePath}`);
      }

      const encryptedData = JSON.parse(fs.readFileSync(encryptedFilePath, 'utf8'));
      return this.decrypt(encryptedData, password);
    } catch (error) {
      throw new Error(`Error obteniendo credenciales: ${error.message}`);
    }
  }
}

module.exports = CredentialsManager;