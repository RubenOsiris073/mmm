#!/bin/bash

echo "Iniciando optimización del frontend..."

# Limpiar cachés y archivos temporales
echo "Limpiando cachés..."
rm -rf node_modules/.cache
rm -rf build
rm -rf .eslintcache

# Limpiar caché de npm
echo "Limpiando caché de npm..."
npm cache clean --force

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    npm ci --prefer-offline
fi

# Optimizar node_modules si existe
if [ -d "node_modules" ]; then
    echo "Optimizando node_modules..."
    # Eliminar archivos innecesarios
    find node_modules -name "*.md" -delete 2>/dev/null || true
    find node_modules -name "CHANGELOG*" -delete 2>/dev/null || true
    find node_modules -name "README*" -delete 2>/dev/null || true
    find node_modules -name "*.test.js" -delete 2>/dev/null || true
    find node_modules -name "test" -type d -exec rm -rf {} + 2>/dev/null || true
fi

echo "Optimización completada!"
echo ""
echo "Para iniciar el servidor optimizado, usa:"
echo "   npm run dev      # Modo desarrollo con Vite"
echo "   npm run start    # Alias para dev"
echo "   npm run build    # Build de producción"
echo "   npm run preview  # Preview del build"