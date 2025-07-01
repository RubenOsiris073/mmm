# 🔐 FISGO Wallet - Sistema de Credenciales Encriptadas

Aplicación Android con Kotlin que utiliza credenciales de Firebase encriptadas para máxima seguridad.

## 📱 Acerca de FISGO Wallet

Aplicación móvil Android desarrollada en Kotlin con:
- **Firebase Authentication** - Autenticación de usuarios
- **Firebase Analytics** - Análisis de uso
- **Stripe SDK** - Procesamiento de pagos
- **Google Play Services** - Servicios de Google
- **Material Design** - UI moderna y atractiva

## 🔐 Sistema de Credenciales Encriptadas

Las credenciales de Firebase (`google-services.json`) están encriptadas usando AES-256-CBC para protegerlas en el repositorio.

### 🚀 Para desarrollo local

```bash
# 1. Clonar el repositorio
git clone https://github.com/RubenOsiris073/FISGO-Monkey-Tech.git
cd FISGO-Monkey-Tech/wallet

# 2. Las credenciales se desencriptan automáticamente durante el build
./gradlew assembleDebug
```

### 🏭 Para compilar en producción

```bash
# Opción 1: Usar variable de entorno personalizada
export WALLET_ENCRYPTION_PASSWORD="tu-contraseña-super-segura"
./gradlew assembleRelease

# Opción 2: Usar gradle.properties
echo "WALLET_ENCRYPTION_PASSWORD=tu-contraseña-super-segura" >> gradle.properties
./gradlew assembleRelease

# Opción 3: Usar contraseña por defecto
./gradlew assembleRelease
```

## 🛠️ Comandos disponibles

### Compilar aplicación
```bash
# Debug
./gradlew assembleDebug

# Release
./gradlew assembleRelease

# Instalar en dispositivo conectado
./gradlew installDebug
```

### Gestionar credenciales
```bash
# Desencriptar manualmente (si es necesario)
./gradlew decryptCredentials

# Encriptar nuevas credenciales (Node.js)
node scripts/encryptWalletCredentials.js

# Desencriptar credenciales (Node.js)
node scripts/decryptWalletCredentials.js
```

### Limpiar proyecto
```bash
./gradlew clean
```

## 🔑 Configuración de contraseña

### Contraseña por defecto:
```
fisgo-wallet-2025-secure-key
```

### Para usar contraseña personalizada:

**Método 1: Variable de entorno**
```bash
export WALLET_ENCRYPTION_PASSWORD="mi-contraseña-segura"
```

**Método 2: gradle.properties**
```properties
WALLET_ENCRYPTION_PASSWORD=mi-contraseña-segura
```

**Método 3: Parámetro de Gradle**
```bash
./gradlew assembleRelease -PWALLET_ENCRYPTION_PASSWORD="mi-contraseña-segura"
```

## 📁 Estructura de archivos

```
wallet/
├── app/
│   ├── google-services.encrypted.json    ✅ SEGURO (GitHub)
│   ├── google-services.json             ❌ IGNORADO (.gitignore)
│   └── build.gradle.kts                 📝 Config con desencriptación
├── android/app/
│   ├── google-services.encrypted.json    ✅ SEGURO (GitHub)
│   └── google-services.json             ❌ IGNORADO (.gitignore)
├── buildSrc/
│   └── src/main/kotlin/
│       └── CredentialsDecryptor.kt      🔐 Lógica de desencriptación
└── scripts/
    ├── encryptWalletCredentials.js      📝 Script de encriptación
    └── decryptWalletCredentials.js      📝 Script de desencriptación
```

## 🔄 Flujo automático

1. **Durante el build**, Gradle detecta si existen archivos encriptados
2. **Si no existen archivos `google-services.json`**, los desencripta automáticamente
3. **Firebase plugin** procesa los archivos desencriptados normalmente
4. **La aplicación se compila** sin problemas

## 📋 Dependencias principales

```kotlin
// Firebase
implementation(platform("com.google.firebase:firebase-bom:32.7.0"))
implementation("com.google.firebase:firebase-auth-ktx")
implementation("com.google.firebase:firebase-analytics-ktx")

// Stripe pagos
implementation("com.stripe:stripe-android:20.37.0")

// Google Play Services
implementation("com.google.android.gms:play-services-auth:21.0.0")

// Material Design
implementation("com.google.android.material:material:1.11.0")
```

## 🚨 Importante

- ✅ **Los archivos `.encrypted.json` SÍ se suben a GitHub**
- ❌ **Los archivos `google-services.json` NO se suben a GitHub**
- 🔐 **La desencriptación es automática durante el build**
- 🔑 **Cambia la contraseña por defecto en producción**

## 🎯 Ventajas del sistema

✅ **Automático** - No requiere pasos manuales  
✅ **Seguro** - Credenciales protegidas con AES-256  
✅ **Compatible** - Funciona con cualquier CI/CD  
✅ **Transparente** - Firebase funciona normalmente  
✅ **Portable** - Funciona en cualquier máquina con la contraseña  

---

**🏢 Desarrollado para:** FISGO Monkey Tech  
**📅 Fecha:** Junio 2025  
**🚀 Versión:** 1.0  
**📱 Plataforma:** Android (Kotlin)