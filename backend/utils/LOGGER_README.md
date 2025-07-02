# Sistema de Logging Mejorado

## Características del nuevo logger:

### 1. **Información de ubicación automática**
- Muestra el archivo y línea donde se ejecuta el log
- Incluye la función que invoca el log
- Ruta relativa desde el directorio backend

### 2. **Colores y formato mejorado**
- Colores diferenciados por nivel de log
- Timestamps formateados
- Separadores visuales para mejor organización

### 3. **Niveles de log disponibles**
- `Logger.error(message, data)` - Errores críticos (rojo)
- `Logger.warn(message, data)` - Advertencias (amarillo)
- `Logger.info(message, data)` - Información general (azul)
- `Logger.success(message, data)` - Operaciones exitosas (verde)
- `Logger.debug(message, data)` - Debug (magenta, solo en desarrollo)
- `Logger.system(message, data)` - Logs del sistema (cyan)

### 4. **Métodos especiales**
- `Logger.separator(title)` - Separador visual
- `Logger.startOperation(name)` - Inicio de operación
- `Logger.endOperation(name, success, duration)` - Fin de operación
- `Logger.httpRequest(method, url, ip, status, duration)` - Requests HTTP

## Ejemplo de uso:

```javascript
const Logger = require('../utils/logger');

// Log básico
Logger.info('Procesando venta', { items: 5, total: 150.00 });

// Operación completa
Logger.startOperation('Product Creation');
try {
  // ... código ...
  Logger.success('Producto creado exitosamente', { id: 'prod_123' });
  Logger.endOperation('Product Creation', true, 250);
} catch (error) {
  Logger.error('Error creando producto', { error: error.message });
  Logger.endOperation('Product Creation', false);
}

// Debug (solo se muestra en desarrollo)
Logger.debug('Estado interno del carrito', { cart });
```

## Formato de salida:

```
[2025-07-01 10:30:45.123] [INFO] services/salesService.js:42 procesarVenta() - Procesando nueva venta
{
  "items": 5,
  "total": 150.00
}

===============================
INICIANDO: PRODUCT CREATION
===============================
[2025-07-01 10:30:45.150] [SYSTEM] services/productService.js:15 - Iniciando operación: Product Creation
[2025-07-01 10:30:45.175] [SUCCESS] services/productService.js:25 createProduct() - Producto creado exitosamente
{
  "id": "prod_123"
}
[2025-07-01 10:30:45.180] [SUCCESS] services/productService.js:30 - Operación completada: Product Creation (250ms)
===============================
COMPLETADO: PRODUCT CREATION
===============================
```

## Migración de console.log existentes:

1. Importar el logger: `const Logger = require('../utils/logger');`
2. Reemplazar:
   - `console.log()` → `Logger.info()`
   - `console.error()` → `Logger.error()`
   - `console.warn()` → `Logger.warn()`

## Configuración:

- Variable de entorno `DEBUG=true` para mostrar logs de debug
- Variable de entorno `NODE_ENV=development` para modo desarrollo
