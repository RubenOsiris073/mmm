# Plan de Refactorización - Módulo POS

## Estructura Propuesta

```
pos/
├── core/                    # Lógica de negocio
│   ├── services/
│   │   ├── DetectionService.js
│   │   ├── CartService.js
│   │   └── PaymentService.js
│   ├── validators/
│   │   ├── ProductValidator.js
│   │   └── PaymentValidator.js
│   └── constants/
│       └── posConstants.js
├── hooks/                   # Hooks optimizados
│   ├── useDetection.js
│   ├── useCart.js
│   ├── usePayment.js
│   └── useProducts.js
├── components/              # Componentes UI puros
│   ├── detection/
│   │   ├── ScannerPanel.jsx
│   │   ├── WebcamCapture.jsx
│   │   └── DetectionResults.jsx
│   ├── cart/
│   │   ├── CartView.jsx
│   │   ├── CartItem.jsx
│   │   └── CartSummary.jsx
│   ├── payment/
│   │   ├── PaymentModal.jsx
│   │   └── PaymentForm.jsx
│   └── products/
│       ├── ProductGrid.jsx
│       ├── ProductCard.jsx
│       └── ProductSearch.jsx
├── containers/              # Componentes contenedores
│   ├── POSContainer.jsx     # Componente principal (< 100 líneas)
│   └── DetectionContainer.jsx
└── utils/
    ├── formatters.js
    └── helpers.js
```

## Beneficios de esta Refactorización

### ✅ Separación de Responsabilidades
- **UI Components**: Solo renderizado y eventos
- **Services**: Lógica de negocio pura
- **Hooks**: Estado y efectos específicos
- **Validators**: Validaciones reutilizables

### ✅ Componentes Pequeños y Enfocados
- Cada componente < 100 líneas
- Una responsabilidad por componente
- Fácil testing unitario

### ✅ Reducción de Acoplamiento
- Inyección de dependencias
- Interfaces claras entre módulos
- Servicios independientes

### ✅ Reutilización de Código
- Validadores compartidos
- Servicios modulares
- Utilities comunes

## Prioridades de Implementación

1. **CRÍTICO**: Extraer DetectionService de POSView
2. **ALTO**: Dividir POSView en componentes más pequeños
3. **MEDIO**: Optimizar hooks existentes
4. **BAJO**: Mejorar estilos y animaciones

## Métricas Objetivo Post-Refactorización

- **Componentes**: Max 100 líneas cada uno
- **Funciones**: Max 20 líneas cada una
- **Hooks**: Max 50 líneas cada uno
- **Cobertura de tests**: Min 80%
- **Complejidad ciclomática**: Max 10 por función