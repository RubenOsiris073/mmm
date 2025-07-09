# Refactorización CSS - Plan de Acción

## Archivos Base (Completados)
- ✅ `/styles/base/variables.css` - Variables CSS globales
- ✅ `/styles/base/reset.css` - Reset y estilos base
- ✅ `/styles/base/bootstrap-overrides.css` - Sobrescrituras de Bootstrap
- ✅ `/styles/base/buttons.css` - Botones custom (no Bootstrap)
- ✅ `/styles/base/utilities.css` - Clases utilitarias
- ✅ `/styles/base/index.css` - Importador de archivos base
- ✅ `/styles/global.css` - Archivo principal global

## Componentes (En progreso)
- ✅ `/styles/components/app-layout.css` - Layout principal de App
- ✅ `/styles/components/themes.css` - Sistema de temas
- ✅ `/styles/components/apex-charts.css` - Estilos de ApexCharts

## Páginas (En progreso)
- ✅ `/styles/pages/products.css` - Página de productos (movido desde products-modern.css)
- ✅ `/styles/pages/dashboard.css` - Página del dashboard

## Pendientes por Refactorizar
- `/styles/auth.css` → `/styles/pages/auth.css`
- `/components/*/**.css` → Mantener en sus carpetas de componentes
- `/styles/themes.css` → ELIMINAR (ya refactorizado)

## Archivos a Mantener en su Ubicación
- `/components/alerts/*.css` - Componentes específicos
- `/components/pos/styles/*.css` - Componentes de POS
- `/components/layout/Navigation.css` - Navegación
- `/components/auth/auth.css` - Componentes de autenticación

## Siguiente Paso
1. Limpiar imports en componentes restantes
2. Eliminar archivos CSS obsoletos
3. Verificar que no hay conflictos
4. Probar la aplicación
