# Sistema CSS Modularizado - FISGO

## Estructura Nueva

```
src/styles/
├── base/                 # Estilos base globales
│   ├── variables.css     # Variables CSS (colores, espaciado, etc.)
│   ├── reset.css        # Reset y estilos base HTML
│   ├── bootstrap-overrides.css  # Sobrescrituras de Bootstrap
│   ├── buttons.css      # Botones custom (no Bootstrap)
│   ├── utilities.css    # Clases utilitarias
│   └── index.css        # Importador de todos los base
├── components/          # Estilos de componentes globales
│   ├── app-layout.css   # Layout principal de la aplicación
│   ├── themes.css       # Sistema de temas claro/oscuro
│   └── apex-charts.css  # Estilos específicos de ApexCharts
├── pages/              # Estilos específicos de páginas
│   ├── products.css    # Página de productos
│   ├── dashboard.css   # Página del dashboard
│   └── auth.css        # Páginas de autenticación
└── global.css          # Archivo principal que importa todo
```

## Uso

### En main.jsx
```javascript
import './styles/global.css'  // Solo este import global
```

### En componentes específicos
```javascript
// Para páginas
import '../styles/pages/products.css'

// Para componentes que mantienen su CSS
import './ComponentName.css'
```

## Variables CSS Disponibles

### Colores
```css
--bg-primary, --bg-secondary, --bg-tertiary
--text-primary, --text-secondary, --text-muted
--border-color, --shadow
--accent-blue, --accent-blue-hover
```

### Espaciado
```css
--spacing-xs (0.25rem) a --spacing-xxl (3rem)
```

### Utilidades
```css
.m-xs, .m-sm, .m-md, .m-lg, .m-xl  # Márgenes
.p-xs, .p-sm, .p-md, .p-lg, .p-xl  # Padding
.text-primary, .text-secondary     # Colores de texto
.bg-primary, .bg-secondary         # Backgrounds
.flex-center, .flex-between        # Flexbox helpers
.transition-all, .transition-fast  # Transiciones
```

## Beneficios

1. **Modularidad**: Cada archivo tiene un propósito específico
2. **Sin conflictos**: Eliminados los CSS globales problemáticos
3. **Mantenibilidad**: Fácil encontrar y editar estilos específicos
4. **Rendimiento**: Solo se cargan los estilos necesarios
5. **Escalabilidad**: Fácil agregar nuevos componentes sin afectar otros

## Migración Completada

- ✅ Estilos base separados y organizados
- ✅ Sistema de temas limpio
- ✅ Layout principal modularizado
- ✅ Páginas principales migradas
- ✅ Eliminados archivos obsoletos
- ✅ Imports actualizados en componentes

## Componentes que Mantienen CSS Propio

Los siguientes componentes conservan sus archivos CSS en sus carpetas:
- `/components/alerts/*.css`
- `/components/pos/styles/*.css`
- `/components/layout/Navigation.css`
- `/components/auth/auth.css`

Esto es correcto ya que son estilos muy específicos del componente.
