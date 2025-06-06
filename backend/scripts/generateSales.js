const { db, COLLECTIONS } = require('../config/firebase');
const { collection, addDoc, getDocs, serverTimestamp } = require('firebase/firestore');

// Métodos de pago posibles
const metodosDepago = [
  'efectivo',
  'tarjeta',
];

// Nombres de clientes aleatorios (mexicanos)
const nombresClientes = [
  'Cliente General'
];

/**
 * Genera una fecha aleatoria entre enero y junio de 2025
 */
function generarFechaAleatoria() {
  const año = 2025;
  const mesInicio = 0; // Enero (0-indexado)
  const mesFin = 5;    // Junio (0-indexado)
  
  const mes = Math.floor(Math.random() * (mesFin - mesInicio + 1)) + mesInicio;
  const diasEnMes = new Date(año, mes + 1, 0).getDate();
  const dia = Math.floor(Math.random() * diasEnMes) + 1;
  
  // Hora aleatoria entre 8:00 AM y 10:00 PM
  const hora = Math.floor(Math.random() * 14) + 8; // 8-21
  const minutos = Math.floor(Math.random() * 60);
  const segundos = Math.floor(Math.random() * 60);
  
  return new Date(año, mes, dia, hora, minutos, segundos);
}

/**
 * Genera una cantidad aleatoria para un producto
 */
function generarCantidadAleatoria() {
  // 70% de las veces cantidad 1-3, 25% cantidad 4-8, 5% cantidad 9-15
  const random = Math.random();
  if (random < 0.7) {
    return Math.floor(Math.random() * 3) + 1; // 1-3
  } else if (random < 0.95) {
    return Math.floor(Math.random() * 5) + 4; // 4-8
  } else {
    return Math.floor(Math.random() * 7) + 9; // 9-15
  }
}

/**
 * Selecciona productos aleatorios para una venta
 */
function seleccionarProductosAleatorios(productos) {
  // Entre 1 y 8 productos por venta
  const numProductos = Math.floor(Math.random() * 8) + 1;
  const productosSeleccionados = [];
  const productosUsados = new Set();
  
  for (let i = 0; i < numProductos; i++) {
    let productoAleatorio;
    let intentos = 0;
    
    // Evitar productos duplicados en la misma venta
    do {
      productoAleatorio = productos[Math.floor(Math.random() * productos.length)];
      intentos++;
    } while (productosUsados.has(productoAleatorio.id) && intentos < 20);
    
    if (!productosUsados.has(productoAleatorio.id)) {
      productosUsados.add(productoAleatorio.id);
      
      const cantidad = generarCantidadAleatoria();
      const precioUnitario = productoAleatorio.precio;
      const subtotal = cantidad * precioUnitario;
      
      productosSeleccionados.push({
        productId: productoAleatorio.id,
        id: productoAleatorio.id,
        nombre: productoAleatorio.nombre,
        precio: precioUnitario,
        cantidad: cantidad,
        subtotal: subtotal,
        categoria: productoAleatorio.categoria,
        marca: productoAleatorio.marca,
        codigo: productoAleatorio.codigo
      });
    }
  }
  
  return productosSeleccionados;
}

/**
 * Calcula el cambio para pagos en efectivo
 */
function calcularCambio(total, metodoPago) {
  if (metodoPago !== 'efectivo') {
    return { amountReceived: total, change: 0 };
  }
  
  // Para efectivo, simular que a veces pagan con billetes grandes
  const random = Math.random();
  let amountReceived;
  
  if (random < 0.3) {
    // 30% paga exacto
    amountReceived = total;
  } else if (random < 0.7) {
    // 40% paga con el siguiente múltiplo de 50
    amountReceived = Math.ceil(total / 50) * 50;
  } else {
    // 30% paga con billetes grandes (100, 200, 500)
    const billetesGrandes = [100, 200, 500];
    const billeteMinimo = billetesGrandes.find(b => b >= total) || 500;
    amountReceived = billeteMinimo;
  }
  
  const change = amountReceived - total;
  return { amountReceived, change };
}

/**
 * Genera una venta aleatoria
 */
function generarVentaAleatoria(productos) {
  const items = seleccionarProductosAleatorios(productos);
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  const metodoPago = metodosDepago[Math.floor(Math.random() * metodosDepago.length)];
  const clientName = nombresClientes[Math.floor(Math.random() * nombresClientes.length)];
  const fecha = generarFechaAleatoria();
  const { amountReceived, change } = calcularCambio(total, metodoPago);
  
  return {
    items,
    total: parseFloat(total.toFixed(2)),
    paymentMethod: metodoPago,
    amountReceived: parseFloat(amountReceived.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    clientName,
    timestamp: fecha,
    createdAt: fecha,
    updatedAt: fecha
  };
}

/**
 * Función principal para generar ventas aleatorias
 */
async function generateSales() {
  try {
    console.log('Iniciando generación de 5000 ventas aleatorias...');
    
    // Obtener productos existentes
    console.log('Obteniendo productos desde Firebase...');
    const productosSnapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
    
    if (productosSnapshot.empty) {
      throw new Error('No hay productos en la base de datos. Ejecuta primero initializeProducts.js');
    }
    
    const productos = [];
    productosSnapshot.forEach(doc => {
      productos.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Se encontraron ${productos.length} productos disponibles`);
    
    // Limpiar ventas existentes (opcional)
    console.log('🧹 Limpiando ventas existentes...');
    const existingSales = await getDocs(collection(db, COLLECTIONS.SALES));
    if (!existingSales.empty) {
      console.log(`⚠️ Se encontraron ${existingSales.size} ventas existentes. Se agregarán las nuevas ventas.`);
    }
    
    // Generar y agregar ventas
    console.log('💰 Generando 1000 ventas aleatorias...');
    const batchSize = 50; // Procesar en lotes para evitar sobrecarga
    const totalVentas = 5000;
    let ventasCreadas = 0;
    let montoTotalVentas = 0;
    const estadisticasPorMes = {};
    const estadisticasPorMetodo = {};
    const productosVendidos = {};
    
    for (let lote = 0; lote < Math.ceil(totalVentas / batchSize); lote++) {
      const ventasLote = [];
      const ventasEnEsteLote = Math.min(batchSize, totalVentas - ventasCreadas);
      
      console.log(`📊 Procesando lote ${lote + 1}: ${ventasEnEsteLote} ventas...`);
      
      for (let i = 0; i < ventasEnEsteLote; i++) {
        const venta = generarVentaAleatoria(productos);
        ventasLote.push(venta);
        
        // Estadísticas
        montoTotalVentas += venta.total;
        
        const mes = venta.timestamp.getMonth() + 1;
        const nombreMes = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'][mes - 1];
        
        if (!estadisticasPorMes[nombreMes]) {
          estadisticasPorMes[nombreMes] = { ventas: 0, monto: 0 };
        }
        estadisticasPorMes[nombreMes].ventas++;
        estadisticasPorMes[nombreMes].monto += venta.total;
        
        if (!estadisticasPorMetodo[venta.paymentMethod]) {
          estadisticasPorMetodo[venta.paymentMethod] = { ventas: 0, monto: 0 };
        }
        estadisticasPorMetodo[venta.paymentMethod].ventas++;
        estadisticasPorMetodo[venta.paymentMethod].monto += venta.total;
        
        // Contar productos vendidos
        venta.items.forEach(item => {
          if (!productosVendidos[item.nombre]) {
            productosVendidos[item.nombre] = { cantidad: 0, monto: 0 };
          }
          productosVendidos[item.nombre].cantidad += item.cantidad;
          productosVendidos[item.nombre].monto += item.subtotal;
        });
      }
      
      // Guardar lote en Firebase
      const promesasVentas = ventasLote.map(async (venta, index) => {
        try {
          const docRef = await addDoc(collection(db, COLLECTIONS.SALES), venta);
          return { id: docRef.id, ...venta };
        } catch (error) {
          console.error(`Error creando venta ${ventasCreadas + index + 1}:`, error);
          throw error;
        }
      });
      
      const ventasGuardadas = await Promise.all(promesasVentas);
      ventasCreadas += ventasGuardadas.length;
      
      console.log(`✅ Lote ${lote + 1} completado: ${ventasGuardadas.length} ventas guardadas`);
    }
    
    // Resumen de productos más vendidos
    const topProductos = Object.entries(productosVendidos)
      .sort((a, b) => b[1].cantidad - a[1].cantidad)
      .slice(0, 10);
    
    console.log('\n📊 RESUMEN DE VENTAS GENERADAS:');
    console.log(`💰 Total de ventas: ${ventasCreadas}`);
    console.log(`💵 Monto total: $${montoTotalVentas.toFixed(2)}`);
    console.log(`📈 Ticket promedio: $${(montoTotalVentas / ventasCreadas).toFixed(2)}`);
    
    console.log('\n📅 VENTAS POR MES:');
    Object.entries(estadisticasPorMes).forEach(([mes, stats]) => {
      console.log(`  ${mes}: ${stats.ventas} ventas - $${stats.monto.toFixed(2)}`);
    });
    
    console.log('\n💳 VENTAS POR MÉTODO DE PAGO:');
    Object.entries(estadisticasPorMetodo).forEach(([metodo, stats]) => {
      const porcentaje = ((stats.ventas / ventasCreadas) * 100).toFixed(1);
      console.log(`  ${metodo}: ${stats.ventas} ventas (${porcentaje}%) - $${stats.monto.toFixed(2)}`);
    });
    
    console.log('\n🏆 TOP 10 PRODUCTOS MÁS VENDIDOS:');
    topProductos.forEach(([nombre, stats], index) => {
      console.log(`  ${index + 1}. ${nombre}: ${stats.cantidad} unidades - $${stats.monto.toFixed(2)}`);
    });
    
    console.log(`\n🎉 ¡Generación de ventas completada exitosamente!`);
    console.log(`📊 Se generaron ${ventasCreadas} ventas desde enero hasta junio de 2025`);
    
    return {
      success: true,
      ventasGeneradas: ventasCreadas,
      montoTotal: montoTotalVentas,
      estadisticasPorMes,
      estadisticasPorMetodo,
      topProductos
    };
    
  } catch (error) {
    console.error('Error durante la generación de ventas:', error);
    throw error;
  }
}

// Ejecutar el script solo si se llama directamente
if (require.main === module) {
  generateSales()
    .then(result => {
      console.log('\nScript completado exitosamente:', {
        ventasGeneradas: result.ventasGeneradas,
        montoTotal: `$${result.montoTotal.toFixed(2)}`
      });
      process.exit(0);
    })
    .catch(error => {
      console.error('\nError en el script:', error);
      process.exit(1);
    });
}

module.exports = { generateSales };