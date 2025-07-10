# Sistema CSS Refactorizado - FISGO

## Estructura Nueva y Clara

```
src/styles/
├── index.css              # 🎯 ÚNICO IMPORT GLOBAL
├── core/                  # 🏗️ FUNDAMENTOS
│   ├── tokens.css         # Variables del design system
│   ├── themes.css         # Temas claro/oscuro
│   └── reset.css          # Reset HTML y base
├── shared/                # 🔄 REUTILIZABLES
│   ├── bootstrap.css      # Sobrescrituras Bootstrap
│   ├── utilities.css      # Clases helper (flex, grid, spacing)
│   └── layout.css         # Layouts de página estándar
└── views/                 # 📄 ESPECÍFICOS DE PÁGINAS
    ├── products.css       # Solo para ProductsPage
    ├── dashboard.css      # Solo para DashboardPage
    └── auth.css           # Solo para páginas de auth
```

## Uso Correcto

### En main.jsx (ÚNICO LUGAR)
```javascript
import './styles/index.css'  // Solo esta línea
```

### En páginas específicas
```javascript
// ProductsPage.jsx
import '../styles/views/products.css'

// DashboardPage.jsx  
import '../styles/views/dashboard.css'
```

### En componentes (mantener sus CSS)
```javascript
// Navigation.jsx
import './Navigation.css'  // CSS específico del componente
```

## Variables Disponibles

### Design Tokens
```css
--color-primary, --color-secondary, --color-success
--space-1 (4px), --space-2 (8px), --space-4 (16px)
--font-size-xs, --font-size-sm, --font-size-base
--radius-sm, --radius-md, --radius-lg
--shadow-sm, --shadow-base, --shadow-md
```

### Tema Semántico
```css
--bg-app, --bg-surface, --bg-surface-2
--text-primary, --text-secondary, --text-muted
--border-color, --border-focus
```

## Clases Utilitarias

### Layout
```css
.flex, .flex-col, .items-center, .justify-between
.grid, .grid-cols-2, .gap-4
.page-container, .page-header, .content-card
```

### Espaciado
```css
.m-0, .m-2, .m-4  (margin)
.p-0, .p-2, .p-4  (padding)
```

### Texto
```css
.text-sm, .text-base, .text-lg
.font-medium, .font-semibold
.text-primary, .text-secondary
```

## Beneficios

1. **Una sola importación global**: `./styles/index.css`
2. **Naming claro**: `core` (fundamentos), `shared` (reutilizable), `views` (específico)
3. **Sin conflictos**: Los componentes mantienen sus CSS propios
4. **Escalable**: Fácil agregar nuevas páginas en `views/`
5. **Mantenible**: Variables centralizadas en `tokens.css`

## Archivos que NO Tocar

Los siguientes mantienen sus CSS en sus carpetas:
- `/components/alerts/*.css`
- `/components/pos/styles/*.css`  
- `/components/layout/Navigation.css`
- `/components/auth/auth.css`

Esto asegura que no rompemos funcionalidad existente.

@import './layout/navigation.css';
