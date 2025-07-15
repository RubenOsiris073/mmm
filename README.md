llamen a dios por favor

Lote 100 completado: 50 ventas guardadas

📊 RESUMEN DE VENTAS GENERADAS:
💰 Total de ventas: 5000
💵 Monto total: $2529434.50
📈 Ticket promedio: $505.869

📅 VENTAS POR MES:
  Febrero: 829 ventas - $415561.50
  Abril: 832 ventas - $430152.50
  Marzo: 798 ventas - $394835.50
  Enero: 852 ventas - $433507.50
  Mayo: 837 ventas - $439791.00
  Junio: 852 ventas - $415586.50

💳 VENTAS POR MÉTODO DE PAGO:
  efectivo: 2478 ventas (49.6%) - $1240088.50
  tarjeta: 2522 ventas (50.4%) - $1289346.00

🏆 TOP 10 PRODUCTOS MÁS VENDIDOS:
  1. Chile ancho seco: 1317 unidades - $36876.00
  2. Chile jalapeño fresco: 1294 unidades - $23292.00
  3. Totopos naturales: 1290 unidades - $32250.00
  4. Gorditas de maíz: 1286 unidades - $25720.00
  5. Crema ácida: 1282 unidades - $23076.00
  6. Chorizo mexicano: 1280 unidades - $53760.00
  7. Cigarros Marlboro: 1256 unidades - $94200.00
  8. Tomate rojo: 1253 unidades - $35084.00
  9. Pilas AA alcalinas: 1230 unidades - $55350.00
  10. Jamoncillo de leche: 1229 unidades - $14748.00

🎉 ¡Generación de ventas completada exitosamente!
📊 Se generaron 5000 ventas desde enero hasta junio de 2025

Script completado exitosamente: { ventasGeneradas: 5000, montoTotal: '$2529434.50' }

💳 Tarjetas de Prueba de Stripe

Tarjetas que APRUEBAN el pago:

Visa:
Número: 4242 4242 4242 4242
CVV: 123 (cualquier 3 dígitos)
Fecha: 12/34 (cualquier fecha futura)
Nombre: Test User (cualquier nombre)

MasterCard:
Número: 5555 5555 5555 4444
CVV: 123
Fecha: 12/34
Nombre: Test User

American Express:
Número: 3782 822463 10005
CVV: 1234 (4 dígitos para AmEx)
Fecha: 12/34
Nombre: Test User


Tarjetas que RECHAZAN el pago (para probar errores):

Tarjeta declinada:
Número: 4000 0000 0000 0002
CVV: 123
Fecha: 12/34

Fondos insuficientes:
Número: 4000 0000 0000 9995
CVV: 123
Fecha: 12/34

Hoja productos: nombre, cantidad, perecedero, ubicacion, lote, categoria, marca, productId, codigo, precio, id, fechaCaducidad, diasParaCaducar, estadoCaducidad.

Hoja ventas: subtotal, venta_paymentMethod, venta_amountReceived, venta_change, venta_timestamp, venta_createdAt, venta_total, venta_updatedAt, venta_clientName, venta_id, productId (para referencia al producto vendido).

Ejemplo de Flujo (Simplificado):

    Usuario apunta la cámara a una "barrita".
    Camera.jsx captura la imagen.
    ObjectDetection.jsx envía la imagen al backend para detección.
    detectionService.js en el backend procesa la imagen con el modelo TensorFlow.
    El modelo detecta "barrita" con 95% de confianza.
    detectionService.js verifica el umbral (95% > 80%).
    detectionService.js mapea "barrita" al ID del producto "Barra Energética".
    detectionService.js llama a cartService.js para añadir 1 unidad de "Barra Energética" al carrito del usuario.
    El backend responde al frontend indicando que se añadió "Barra Energética".
    El frontend (useCart.js) actualiza el estado del carrito.
    ShoppingCart.jsx y CartPanel.jsx muestran la "Barra Energética" en el carrito.
    Un Toast (toastHelper.js) muestra "Barra Energética añadida al carrito".
