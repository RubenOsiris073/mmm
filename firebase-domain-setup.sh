#!/bin/bash

# Script para obtener información del dominio actual para Firebase Auth

echo "=== Información del dominio actual para Firebase Auth ==="
echo ""

# Obtener la URL del codespace
if [ -n "$CODESPACE_NAME" ]; then
    echo "Codespace Name: $CODESPACE_NAME"
    echo "GitHub Codespace URL: https://$CODESPACE_NAME-3000.app.github.dev"
    echo ""
    echo "Dominios a agregar en Firebase Auth:"
    echo "1. https://$CODESPACE_NAME-3000.app.github.dev"
    echo "2. $CODESPACE_NAME-3000.app.github.dev"
    echo ""
else
    echo "No estás en un GitHub Codespace"
    echo "URL actual: $(curl -s ifconfig.me 2>/dev/null || echo 'No disponible')"
fi

echo "Para configurar Firebase Auth:"
echo "1. Ve a https://console.firebase.google.com"
echo "2. Selecciona tu proyecto: productos-75280"
echo "3. Ve a Authentication > Settings > Authorized domains"
echo "4. Agrega los dominios listados arriba"
echo ""
echo "Credenciales de prueba:"
echo "Email: rubenosiris073@gmail.com"
echo "Password: mmm-aguachile-2025"
