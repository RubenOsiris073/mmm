const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { DoubleEncryptionManager } = require('../scripts/doubleEncryption');

dotenv.config();

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  let serviceAccount;
  
  try {
    // Método 1: Variable de entorno con credenciales completas en Base64
    if (process.env.GOOGLE_SERVICE_ACCOUNT_BASE64) {
      console.log('Usando credenciales desde variable de entorno (Base64)');
      const credentialsBuffer = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_BASE64, 'base64');
      serviceAccount = JSON.parse(credentialsBuffer.toString('utf8'));
    }
    
    // Método 2: Archivo con doble encriptación AES (NUEVO)
    else if (fs.existsSync(path.join(__dirname, '../config/google-credentials.double-encrypted.json'))) {
      console.log('Usando credenciales con doble encriptación AES para Firebase Admin');
      const doubleEncryption = new DoubleEncryptionManager();
      const encryptedFilePath = path.join(__dirname, '../config/google-credentials.double-encrypted.json');
      const masterPassword = process.env.MASTER_ENCRYPTION_KEY;
      
      try {
        const doubleEncryptedData = JSON.parse(fs.readFileSync(encryptedFilePath, 'utf8'));
        serviceAccount = doubleEncryption.doubleDecrypt(doubleEncryptedData, masterPassword);
        console.log('Credenciales de Firebase Admin desencriptadas exitosamente');
      } catch (error) {
        console.error('Error desencriptando credenciales:', error.message);
        throw new Error('No se pudieron desencriptar las credenciales de Firebase Admin');
      }
    }
    
    // Método 3: Archivo encriptado simple (FALLBACK)
    else if (fs.existsSync(path.join(__dirname, '../config/google-credentials.encrypted.json'))) {
      console.log('Usando credenciales encriptadas para Firebase Admin');
      const CredentialsManager = require('../utils/credentialsManager');
      const credentialsManager = new CredentialsManager();
      const encryptedFilePath = path.join(__dirname, '../config/google-credentials.encrypted.json');
      const password = process.env.ENCRYPTION_PASSWORD;
      
      serviceAccount = credentialsManager.getDecryptedCredentials(encryptedFilePath, password);
      console.log('Credenciales de Firebase Admin desencriptadas exitosamente');
    }
    
    // Método 3: Archivo local (fallback)
    else {
      console.log('Buscando archivo de credenciales local para Firebase Admin...');
      const possiblePaths = [
        '../config/google-service-account.json',
        '../scripts/config/google-service-account.json'
      ];
      
      let foundPath = null;
      for (const filePath of possiblePaths) {
        const fullPath = path.join(__dirname, filePath);
        if (fs.existsSync(fullPath)) {
          foundPath = fullPath;
          break;
        }
      }
      
      if (!foundPath) {
        throw new Error('No se encontraron credenciales de Google para Firebase Admin. Configura GOOGLE_SERVICE_ACCOUNT_BASE64, ENCRYPTION_PASSWORD, o coloca el archivo encriptado');
      }
      
      serviceAccount = require(foundPath);
    }
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    
    console.log('Firebase Admin inicializado correctamente');
    
  } catch (error) {
    console.error('Error inicializando Firebase Admin:', error.message);
    throw new Error(`No se pudo inicializar Firebase Admin: ${error.message}`);
  }
}

// Middleware para verificar token de Firebase
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token de autorización requerido',
        message: 'Debe incluir un token Bearer en el header Authorization' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verificar el token de Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Agregar información del usuario al request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture
    };
    
    next();
  } catch (error) {
    console.error('Error verificando token de Firebase:', error.message);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        error: 'Token expirado',
        message: 'El token de autenticación ha expirado' 
      });
    }
    
    if (error.code === 'auth/argument-error') {
      return res.status(401).json({ 
        error: 'Token inválido',
        message: 'El token de autenticación no es válido' 
      });
    }
    
    return res.status(401).json({ 
      error: 'Error de autenticación',
      message: 'No se pudo verificar el token de autenticación' 
    });
  }
};

module.exports = {
  verifyToken
};