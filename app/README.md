# MMM Aguachile Wallet - App Móvil

Una aplicación wallet móvil desarrollada con React Native y Expo para el sistema POS de MMM Aguachile.

## 🚀 Características

- ✅ Login con Google (implementado)
- ✅ Login con email/contraseña
- ✅ Pantalla de wallet con saldo y transacciones
- ✅ Navegación automática basada en autenticación
- ✅ Integración con Firebase
- ✅ Diseño responsivo y moderno

## 📱 Pantallas

1. **LoginScreen**: Pantalla de inicio de sesión con opciones de Google y email/contraseña
2. **WalletScreen**: Pantalla principal del wallet con saldo y historial de transacciones

## 🛠️ Configuración

### Prerrequisitos

- Node.js instalado
- Expo CLI instalado (`npm install -g expo-cli`)
- Dispositivo físico o emulador Android/iOS

### Instalación

```bash
# Navegar a la carpeta de la app
cd app

# Instalar dependencias
npm install

# Iniciar la aplicación
npm start
```

### Configuración de Google Sign-In

Para que funcione correctamente el login con Google, necesitas:

1. **Configurar Firebase Console**:
   - Ir a [Firebase Console](https://console.firebase.google.com)
   - Seleccionar tu proyecto `mmm-aguachile`
   - Ir a Authentication > Sign-in method
   - Habilitar Google como proveedor
   - Configurar los dominios autorizados

2. **Obtener Client IDs**:
   - En Firebase Console, ir a Project Settings
   - Descargar `google-services.json` (Android) y `GoogleService-Info.plist` (iOS)
   - Colocar estos archivos en la raíz de la carpeta `app/`

3. **Actualizar Client IDs en app.json**:
   - Reemplazar los client IDs de ejemplo con los reales de tu proyecto

### Configuración de Firebase

El archivo `services/firebase.js` ya está configurado con:
- Autenticación con email/contraseña
- Autenticación con Google
- Integración con Firestore

## 📁 Estructura del Proyecto

```
app/
├── contexts/
│   └── AuthContext.js       # Contexto de autenticación
├── screens/
│   ├── LoginScreen.js       # Pantalla de login
│   └── WalletScreen.js      # Pantalla del wallet
├── services/
│   └── firebase.js          # Servicios de Firebase
├── App.js                   # Componente principal
├── app.json                 # Configuración de Expo
└── package.json             # Dependencias
```

## 🎯 Funcionalidades Implementadas

### Autenticación
- [x] Login con Google (método principal)
- [x] Login con email/contraseña (método alternativo)
- [x] Logout seguro
- [x] Manejo de estados de autenticación
- [x] Navegación automática basada en autenticación

### Wallet
- [x] Visualización de saldo actual
- [x] Historial de transacciones
- [x] Diferentes tipos de transacciones (entrada/salida)
- [x] Estados de transacciones (completada/pendiente)
- [x] Refresh para actualizar datos
- [x] Formateo de moneda y fechas

### UI/UX
- [x] Diseño moderno y responsivo
- [x] Colores corporativos de MMM Aguachile
- [x] Estados de carga (loading)
- [x] Manejo de errores con alertas
- [x] Iconografía intuitiva

## 🔄 Próximas Funcionalidades

- [ ] Conectar con backend real para transacciones
- [ ] Notificaciones push
- [ ] Código QR para pagos
- [ ] Historial detallado de transacciones
- [ ] Configuración de perfil de usuario
- [ ] Modo oscuro

## 🚀 Uso

1. **Abrir la app**: Al iniciar, verás la pantalla de login
2. **Iniciar sesión**: 
   - Opción principal: "Continuar con Google"
   - Opción alternativa: Email y contraseña
3. **Ver wallet**: Una vez autenticado, verás tu saldo y transacciones
4. **Navegar**: Usa los botones "Recargar" y "Enviar" (próximamente funcionales)
5. **Cerrar sesión**: Toca "Salir" en la esquina superior derecha

## 🔧 Comandos Útiles

```bash
# Iniciar en modo desarrollo
npm start

# Iniciar específicamente para Android
npm run android

# Iniciar específicamente para iOS
npm run ios

# Iniciar para web
npm run web

# Limpiar caché de Expo
expo r -c
```

## 📝 Notas Importantes

- La app está configurada para usar Expo Go para desarrollo
- Los datos de transacciones actuales son de ejemplo (mock data)
- Necesitas configurar correctamente Firebase para que funcione en producción
- Los Client IDs de Google en `app.json` son de ejemplo y deben ser reemplazados

## 🐛 Troubleshooting

**Error de Google Sign-In**: Verificar que los Client IDs sean correctos y que Firebase esté configurado

**Error de Firebase**: Verificar la configuración en `services/firebase.js`

**App no carga**: Ejecutar `expo r -c` para limpiar caché

## 👨‍💻 Desarrollo

Para continuar el desarrollo:

1. Los servicios de Firebase están en `services/firebase.js`
2. El contexto de autenticación está en `contexts/AuthContext.js`
3. Las pantallas están en la carpeta `screens/`
4. La navegación se maneja en `App.js`

La app está lista para funcionar con Google Sign-In y tiene una base sólida para expandir las funcionalidades del wallet.