# Sistema CSS Eficiente - Guía de Implementación

## Uso Práctico del Sistema

### Ejemplo: Card con el nuevo sistema
```jsx
// Antes (con CSS custom)
<div className="product-card custom-shadow hover-effect">

// Después (con sistema utilitario)
<div className="bg-primary border rounded-lg shadow-md hover-lift p-4 transition-all">
```

### Ejemplo: Layout responsive
```jsx
// Grid responsive automático
<div className="grid-responsive gap-4 p-4">
  <div className="bg-secondary rounded p-3">Item 1</div>
  <div className="bg-secondary rounded p-3">Item 2</div>
  <div className="bg-secondary rounded p-3">Item 3</div>
</div>

// Layout con sidebar
<div className="layout-sidebar">
  <aside className="bg-secondary p-4">Sidebar</aside>
  <main className="p-4">Contenido principal</main>
</div>
```

### Ejemplo: Animaciones
```jsx
// Entrada con animación
<div className="animate-slide-in-up">
  <h2>Título animado</h2>
</div>

// Loading skeleton
<div className="skeleton rounded h-4 w-3/4 mb-2"></div>
<div className="skeleton rounded h-4 w-1/2"></div>
```

### Ejemplo: Espaciado consistente
```jsx
// Sistema de espaciado 8px
<div className="p-4 m-2 gap-3">  // 16px padding, 8px margin, 12px gap
  <h3 className="mb-3">Título</h3>     // 12px margin bottom
  <p className="text-secondary">Texto</p>
</div>
```

## Variables CSS Más Usadas

```css
/* Espaciado más común */
var(--space-2)  /* 8px */
var(--space-4)  /* 16px */
var(--space-6)  /* 24px */

/* Colores principales */
var(--bg-primary)
var(--text-primary)
var(--accent-blue)

/* Sombras */
var(--shadow-sm)
var(--shadow-md)

/* Transiciones */
var(--duration-200)
var(--ease-out)
```

## Clases Más Útiles

### Layout
- `flex items-center justify-between`
- `grid grid-cols-3 gap-4`
- `container-custom mx-auto`

### Espaciado
- `p-4 m-2` (padding 16px, margin 8px)
- `px-6 py-3` (padding horizontal 24px, vertical 12px)
- `gap-4` (gap 16px para flexbox/grid)

### Tipografía
- `text-lg font-semibold`
- `text-secondary leading-relaxed`

### Estados
- `hover-lift transition-all`
- `hover-scale hover-glow`

### Responsive
- `hidden md:block` (oculto en móvil, visible en desktop)
- `grid-cols-1 md:grid-cols-3` (1 columna móvil, 3 desktop)

## Beneficios del Sistema

1. **Consistencia**: Todos los espacios usan sistema 8px
2. **Velocidad**: No necesitas escribir CSS custom
3. **Responsive**: Clases automáticas para breakpoints
4. **Performance**: Solo clases CSS necesarias
5. **Mantenibilidad**: Cambios centralizados en variables
6. **Escalabilidad**: Fácil agregar nuevas utilidades

## Flujo de Trabajo Recomendado

1. **Usa variables CSS** para valores personalizados
2. **Combina clases utilitarias** para layouts rápidos
3. **CSS custom solo** para componentes muy específicos
4. **Mantén archivos CSS** organizados por función
5. **Testea responsive** con las clases incluidas

## Migración Gradual

Para migrar componentes existentes:

1. Reemplaza `margin/padding` custom por clases `m-* p-*`
2. Usa `flex items-center` en lugar de CSS flexbox custom
3. Cambia colores hardcoded por variables CSS
4. Reemplaza transiciones custom por clases `transition-*`
5. Usa `grid-responsive` para layouts de cards

Este sistema te permitirá implementar nuevas features mucho más rápido y mantener consistencia visual en toda la aplicación.
