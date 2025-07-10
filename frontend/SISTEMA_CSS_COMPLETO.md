# Sistema CSS Modular - FISGO

## Estructura Definitiva

```
src/styles/
├── core/                    # Fundamentos del sistema
│   ├── tokens.css          # Variables CSS y design tokens  
│   ├── themes.css          # Temas claro/oscuro
│   └── reset.css           # Reset HTML y estilos base
├── shared/                 # Componentes reutilizables
│   ├── bootstrap.css       # Sobrescrituras de Bootstrap
│   ├── utilities.css       # Clases utilitarias (flex, spacing, etc)
│   ├── layout.css          # Layouts de página estándar
│   ├── sidebar.css         # Navegación sidebar global
│   └── components.css      # Componentes UI (botones, modales, etc)
├── views/                  # Estilos específicos de páginas
│   ├── products.css        # Página de productos
│   ├── dashboard.css       # Página del dashboard
│   ├── auth.css           # Páginas de autenticación
│   └── alerts.css         # Página de alertas
├── index.css              # Archivo principal (importa core + shared)
└── README.md              # Esta documentación
```

## Uso Correcto

### 1. En main.jsx (SOLO UNA VEZ)
```javascript
import './styles/index.css'  // Importa core + shared
```

### 2. En páginas específicas
```javascript
// ProductsPage.jsx
import '../styles/views/products.css'

// DashboardPage.jsx  
import '../styles/views/dashboard.css'

// AuthenticationPage.jsx
import '../styles/views/auth.css'
```

### 3. Los componentes individuales mantienen su CSS
```javascript
// Los componentes en /components/ mantienen sus propios .css
import './ComponentName.css'  // Específico del componente
```

## Variables CSS Disponibles

### Design Tokens Core
```css
--color-primary: #0052cc;
--color-primary-hover: #003d99;
--color-success: #198754;
--color-warning: #ffc107;
--color-danger: #dc3545;

--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */  
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */

--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */

--radius-md: 0.375rem;      /* 6px */
--radius-lg: 0.5rem;        /* 8px */
```

### Variables de Tema (automáticas)
```css
--bg-app: /* Color de fondo principal */
--bg-surface: /* Color de cards/superficies */  
--bg-hover: /* Color de hover */
--text-primary: /* Texto principal */
--text-secondary: /* Texto secundario */
--border-color: /* Color de bordes */
```

## Sistema Completo y Funcional

- ✅ Estructura limpia y lógica
- ✅ Variables CSS organizadas
- ✅ Sistema de temas funcional
- ✅ Utilidades completas
- ✅ Layouts responsive
- ✅ Componentes UI listos
- ✅ Páginas específicas creadas
- ✅ Imports actualizados
- ✅ Sin conflictos CSS
- ✅ Documentación completa

El sistema está listo para usar. Los estilos del sidebar y botones ahora funcionarán correctamente sin conflictos.
