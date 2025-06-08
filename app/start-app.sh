#!/bin/bash

# Script para iniciar Expo con configuración automática
# Detecta automáticamente la IP WiFi y configura Expo

echo "🚀 Iniciando MMM Aguachile App..."

# Detectar IP WiFi específicamente de la interfaz wlan0
WIFI_IP=$(ip addr show wlan0 2>/dev/null | grep "inet " | awk '{print $2}' | cut -d/ -f1)

# Si no encuentra wlan0, buscar cualquier interfaz WiFi
if [ -z "$WIFI_IP" ]; then
    WIFI_IP=$(ip addr show | grep -A 2 "wl" | grep "inet " | awk '{print $2}' | cut -d/ -f1 | head -1)
fi

# Si sigue sin encontrar, usar la IP conocida
if [ -z "$WIFI_IP" ]; then
    echo "❌ No se pudo detectar la IP WiFi automáticamente. Usando IP conocida..."
    WIFI_IP="154.0.0.5"
fi

echo "📡 Usando IP WiFi: $WIFI_IP"
echo "🔧 Configurando variables de entorno..."

# Configurar variables de entorno para Expo
export REACT_NATIVE_PACKAGER_HOSTNAME=$WIFI_IP
export EXPO_DEVTOOLS_LISTEN_ADDRESS=$WIFI_IP

echo "✅ Configuración lista. Iniciando Expo..."
echo "📱 Escanea el QR cuando aparezca"

# Iniciar Expo en modo LAN
npx expo start --lan