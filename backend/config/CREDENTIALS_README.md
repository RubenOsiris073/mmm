# Sistema Unificado de Credenciales

El sistema de credenciales ha sido simplificado a solo 2 archivos principales:

## Archivos de Encriptación

### 1. `doubleEncryption.js`
- Sistema de doble encriptación AES para máxima seguridad
- Genera contraseñas aleatorias automáticamente
- Encripta las credenciales con contraseña aleatoria
- Luego encripta la contraseña con clave maestra
- Usado para el archivo: `google-credentials.double-encrypted.json`

### 2. `credentialsBackup.js`
- Sistema unificado para manejo de credenciales
- Encriptación/desencriptación simple
- Creación y restauración de backups en partes
- CLI integrado con múltiples comandos

## Uso

### Encriptar credenciales
```bash
node scripts/credentialsBackup.js encrypt
```

### Desencriptar credenciales
```bash
node scripts/credentialsBackup.js decrypt
```

### Crear backup en partes
```bash
node scripts/credentialsBackup.js backup
```

### Restaurar desde partes
```bash
node scripts/credentialsBackup.js restore
```

### Crear doble encriptación
```bash
node scripts/doubleEncryption.js
```

## Variables de Entorno

- `ENCRYPTION_PASSWORD`: Contraseña para encriptación simple
- `MASTER_ENCRYPTION_KEY`: Clave maestra para doble encriptación

## Archivos Eliminados

Los siguientes archivos redundantes fueron eliminados:
- `encryptCredentials.js`
- `decryptCredentials.js`
- `createEncryptedBackup.js`
- `createBackupParts.js`

Toda la funcionalidad se consolidó en los 2 archivos principales.
