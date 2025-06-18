import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Función mejorada para generar PDF de una factura individual con diseño Bootstrap
export const generateInvoicePDF = async (sale) => {
  try {
    console.log('🎯 Generando PDF con diseño Bootstrap profesional:', sale);
    
    // Crear documento PDF
    const doc = new jsPDF();

    // Añadir metadatos
    doc.setProperties({
      title: `Factura-${sale.id || sale._id || 'No-ID'}`,
      subject: 'Factura de venta',
      author: 'Sistema de Gestión',
      keywords: 'factura, venta, cliente',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 15;

    console.log('🎨 Aplicando diseño estilo Bootstrap...');

    // === COLORES BOOTSTRAP ===
    const colors = {
      primary: [0, 123, 255],      // Bootstrap primary blue
      secondary: [108, 117, 125],  // Bootstrap secondary gray
      success: [40, 167, 69],      // Bootstrap success green
      light: [248, 249, 250],      // Bootstrap light
      dark: [52, 58, 64],          // Bootstrap dark
      border: [222, 226, 230],     // Bootstrap border
      white: [255, 255, 255]
    };

    // === ENCABEZADO CON GRADIENTE VISUAL ===
    // Fondo azul suave para el encabezado
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    // Overlay semi-transparente simulado con un rectángulo más claro
    doc.setFillColor(230, 240, 255);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // === LOGO Y TÍTULO ===
    yPos = 25;
    
    // Simular icono de factura con texto
    doc.setFontSize(20);
    doc.setTextColor(...colors.white);
    doc.setFont('helvetica', 'bold');
    doc.text('📄', 20, yPos);
    
    // Título principal
    doc.setFontSize(28);
    doc.setTextColor(...colors.dark);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURA', 35, yPos);

    // Información de la empresa con mejor jerarquía
    const companyInfo = [
      { text: 'EMPRESA S.A.', size: 16, weight: 'bold', color: colors.dark },
      { text: 'Gestión Integral de Productos', size: 11, weight: 'normal', color: colors.secondary },
      { text: '📍 Av. Principal #123, Ciudad', size: 10, weight: 'normal', color: colors.secondary },
      { text: '📞 +123 456 7890', size: 10, weight: 'normal', color: colors.secondary },
      { text: '✉️ info@empresa.com', size: 10, weight: 'normal', color: colors.secondary }
    ];

    let companyY = 18;
    companyInfo.forEach(info => {
      doc.setFontSize(info.size);
      doc.setFont('helvetica', info.weight);
      doc.setTextColor(...info.color);
      doc.text(info.text, pageWidth - 15, companyY, { align: 'right' });
      companyY += info.size === 16 ? 8 : 5;
    });

    yPos = 55;

    // === TARJETA DE INFORMACIÓN DE FACTURA ===
    // Card principal con sombra simulada
    doc.setFillColor(...colors.light);
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(1);
    doc.rect(15, yPos, pageWidth - 30, 35, 'FD');
    
    // Sombra simulada
    doc.setFillColor(200, 200, 200);
    doc.rect(16, yPos + 1, pageWidth - 30, 35, 'F');
    doc.setFillColor(...colors.light);
    doc.rect(15, yPos, pageWidth - 30, 35, 'FD');

    // Header de la card
    doc.setFillColor(...colors.primary);
    doc.rect(15, yPos, pageWidth - 30, 12, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(...colors.white);
    doc.setFont('helvetica', 'bold');
    doc.text('📋 INFORMACIÓN DE FACTURA', 20, yPos + 8);

    // Contenido de la card
    yPos += 20;
    
    // Información en dos columnas
    doc.setTextColor(...colors.dark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('FACTURA #:', 25, yPos);
    
    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`${sale.id || sale._id || 'No-ID'}`, 70, yPos);

    // Fecha con formato mejorado
    const fechaStr = sale.date || sale.fecha || sale.timestamp;
    let fechaFormateada = 'Fecha no disponible';
    if (fechaStr) {
      try {
        const fecha = new Date(fechaStr);
        fechaFormateada = format(fecha, 'dd \'de\' MMMM \'de\' yyyy, HH:mm', { locale: es });
      } catch (error) {
        fechaFormateada = new Date(fechaStr).toLocaleDateString();
      }
    }

    doc.setTextColor(...colors.dark);
    doc.setFont('helvetica', 'bold');
    doc.text('FECHA Y HORA:', pageWidth - 95, yPos);
    doc.setTextColor(...colors.secondary);
    doc.setFont('helvetica', 'normal');
    doc.text(fechaFormateada, pageWidth - 20, yPos, { align: 'right' });

    yPos += 10;
    
    // Estado de pago con badge
    doc.setTextColor(...colors.dark);
    doc.setFont('helvetica', 'bold');
    doc.text('ESTADO:', 25, yPos);
    
    // Badge de estado
    doc.setFillColor(...colors.success);
    doc.setDrawColor(...colors.success);
    doc.roundedRect(65, yPos - 5, 25, 8, 2, 2, 'FD');
    doc.setTextColor(...colors.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('PAGADO', 77.5, yPos, { align: 'center' });

    yPos += 25;

    // === CARDS DE CLIENTE Y PAGO ===
    const cardHeight = 55;
    const cardWidth = (pageWidth - 40) / 2 - 5;
    
    // Card Cliente
    doc.setFillColor(...colors.white);
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(1);
    doc.rect(15, yPos, cardWidth, cardHeight, 'FD');
    
    // Header de cliente
    doc.setFillColor(...colors.secondary);
    doc.rect(15, yPos, cardWidth, 12, 'F');
    doc.setFontSize(11);
    doc.setTextColor(...colors.white);
    doc.setFont('helvetica', 'bold');
    doc.text('👤 CLIENTE', 20, yPos + 8);
    
    // Contenido cliente
    doc.setTextColor(...colors.dark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Nombre:', 20, yPos + 22);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.secondary);
    const customerName = sale.customerName || sale.client || sale.cliente || 'Cliente General';
    const displayCustomerName = customerName.length > 25 
      ? customerName.substring(0, 25) + '...' 
      : customerName;
    doc.text(displayCustomerName, 20, yPos + 32);
    
    // Identificación (si existe)
    if (sale.customerDocument || sale.clientId) {
      doc.setTextColor(...colors.dark);
      doc.setFont('helvetica', 'bold');
      doc.text('ID:', 20, yPos + 42);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.secondary);
      doc.text(sale.customerDocument || sale.clientId, 35, yPos + 42);
    }

    // Card Pago
    const paymentX = 15 + cardWidth + 10;
    doc.setFillColor(...colors.white);
    doc.setDrawColor(...colors.border);
    doc.rect(paymentX, yPos, cardWidth, cardHeight, 'FD');
    
    // Header de pago
    doc.setFillColor(...colors.primary);
    doc.rect(paymentX, yPos, cardWidth, 12, 'F');
    doc.setFontSize(11);
    doc.setTextColor(...colors.white);
    doc.setFont('helvetica', 'bold');
    doc.text('💳 PAGO', paymentX + 5, yPos + 8);
    
    // Contenido pago
    doc.setTextColor(...colors.dark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Método:', paymentX + 5, yPos + 22);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.secondary);
    const paymentMethodIcons = {
      'efectivo': '💵 Efectivo',
      'tarjeta': '💳 Tarjeta',
      'transferencia': '🏦 Transferencia'
    };
    const paymentMethod = sale.paymentMethod || 'efectivo';
    const displayPaymentMethod = paymentMethodIcons[paymentMethod] || `💰 ${paymentMethod}`;
    doc.text(displayPaymentMethod, paymentX + 5, yPos + 32);
    
    // Información de cambio
    if (sale.amountReceived && sale.change !== undefined) {
      doc.setTextColor(...colors.dark);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Recibido:', paymentX + 5, yPos + 42);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.secondary);
      doc.text(`$${sale.amountReceived.toFixed(2)}`, paymentX + cardWidth - 5, yPos + 42, { align: 'right' });
      
      doc.setTextColor(...colors.dark);
      doc.setFont('helvetica', 'bold');
      doc.text('Cambio:', paymentX + 5, yPos + 50);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.success);
      doc.text(`$${sale.change.toFixed(2)}`, paymentX + cardWidth - 5, yPos + 50, { align: 'right' });
    }

    yPos += cardHeight + 15;

    // === TABLA DE PRODUCTOS ESTILO BOOTSTRAP ===
    doc.setFillColor(...colors.white);
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(1);
    
    const tableStartX = 15;
    const tableWidth = pageWidth - 30;
    const rowHeight = 12;
    
    // Header de la tabla
    doc.setFillColor(...colors.dark);
    doc.rect(tableStartX, yPos, tableWidth, rowHeight, 'FD');
    
    doc.setFontSize(10);
    doc.setTextColor(...colors.white);
    doc.setFont('helvetica', 'bold');
    
    // Columnas optimizadas
    const colWidths = [18, 85, 25, 35, 37];
    const headers = ['#', '📦 Producto', 'Cant.', 'Precio', 'Total'];
    
    let currentX = tableStartX;
    headers.forEach((header, index) => {
      const centerX = currentX + colWidths[index] / 2;
      doc.text(header, centerX, yPos + 8, { align: 'center' });
      currentX += colWidths[index];
    });
    
    yPos += rowHeight;
    
    // Filas de productos con diseño Bootstrap
    sale.items.forEach((item, index) => {
      // Fila con color alternado
      if (index % 2 === 0) {
        doc.setFillColor(...colors.light);
        doc.rect(tableStartX, yPos, tableWidth, rowHeight, 'F');
      }
      
      // Bordes sutiles
      doc.setDrawColor(...colors.border);
      doc.setLineWidth(0.3);
      doc.line(tableStartX, yPos + rowHeight, tableStartX + tableWidth, yPos + rowHeight);
      
      doc.setFontSize(9);
      doc.setTextColor(...colors.dark);
      doc.setFont('helvetica', 'normal');
      
      currentX = tableStartX;
      
      // Número con círculo
      doc.setFillColor(...colors.primary);
      doc.circle(currentX + 9, yPos + 6, 4, 'F');
      doc.setTextColor(...colors.white);
      doc.setFont('helvetica', 'bold');
      doc.text((index + 1).toString(), currentX + 9, yPos + 7.5, { align: 'center' });
      currentX += colWidths[0];
      
      // Nombre del producto
      doc.setTextColor(...colors.dark);
      doc.setFont('helvetica', 'normal');
      const productName = item.nombre || item.name || 'Producto';
      const maxNameLength = 26;
      const displayName = productName.length > maxNameLength 
        ? productName.substring(0, maxNameLength) + '...' 
        : productName;
      doc.text(displayName, currentX + 2, yPos + 7.5);
      currentX += colWidths[1];
      
      // Cantidad con badge
      doc.setFillColor(...colors.secondary);
      doc.roundedRect(currentX + 5, yPos + 2, 15, 8, 1, 1, 'F');
      doc.setTextColor(...colors.white);
      doc.setFont('helvetica', 'bold');
      doc.text(item.quantity.toString(), currentX + 12.5, yPos + 7.5, { align: 'center' });
      currentX += colWidths[2];
      
      // Precio unitario
      doc.setTextColor(...colors.secondary);
      doc.setFont('helvetica', 'normal');
      doc.text(`$${item.price.toFixed(2)}`, currentX + colWidths[3] / 2, yPos + 7.5, { align: 'center' });
      currentX += colWidths[3];
      
      // Total con énfasis
      doc.setTextColor(...colors.dark);
      doc.setFont('helvetica', 'bold');
      doc.text(`$${(item.quantity * item.price).toFixed(2)}`, currentX + colWidths[4] / 2, yPos + 7.5, { align: 'center' });
      
      yPos += rowHeight;
    });

    // === TOTAL CON DISEÑO DESTACADO ===
    yPos += 8;
    
    // Card del total
    const totalHeight = 20;
    doc.setFillColor(...colors.success);
    doc.setDrawColor(...colors.success);
    doc.roundedRect(15, yPos, pageWidth - 30, totalHeight, 3, 3, 'FD');
    
    // Sombra del total
    doc.setFillColor(0, 100, 0, 0.1);
    doc.roundedRect(16, yPos + 1, pageWidth - 30, totalHeight, 3, 3, 'F');
    doc.setFillColor(...colors.success);
    doc.roundedRect(15, yPos, pageWidth - 30, totalHeight, 3, 3, 'FD');
    
    doc.setFontSize(14);
    doc.setTextColor(...colors.white);
    doc.setFont('helvetica', 'bold');
    doc.text('💰 TOTAL A PAGAR:', 25, yPos + 13);
    
    doc.setFontSize(18);
    doc.text(`$${sale.total.toFixed(2)}`, pageWidth - 25, yPos + 13, { align: 'right' });

    yPos += totalHeight + 15;

    // === SECCIÓN DE NOTAS CON MEJOR DISEÑO ===
    if (yPos < pageHeight - 90) {
      doc.setFillColor(...colors.light);
      doc.setDrawColor(...colors.border);
      doc.setLineWidth(1);
      doc.roundedRect(15, yPos, pageWidth - 30, 35, 2, 2, 'FD');
      
      // Header de notas
      doc.setFillColor(...colors.secondary);
      doc.roundedRect(15, yPos, pageWidth - 30, 10, 2, 2, 'F');
      doc.rect(15, yPos + 8, pageWidth - 30, 2, 'F'); // Para mantener las esquinas rectas abajo
      
      doc.setFontSize(10);
      doc.setTextColor(...colors.white);
      doc.setFont('helvetica', 'bold');
      doc.text('📝 NOTAS IMPORTANTES', 20, yPos + 7);
      
      // Contenido de notas
      doc.setFontSize(10);
      doc.setTextColor(...colors.dark);
      doc.setFont('helvetica', 'normal');
      doc.text('✓ Gracias por su compra. Este documento sirve como comprobante de pago.', 20, yPos + 20);
      doc.text('✓ Para cualquier consulta, conserve este documento.', 20, yPos + 28);
      
      yPos += 45;
    }

    // === PIE DE PÁGINA PROFESIONAL ===
    const footerY = pageHeight - 25;
    
    // Línea decorativa
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(1);
    doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);
    
    // Información del pie
    doc.setFontSize(9);
    doc.setTextColor(...colors.secondary);
    doc.setFont('helvetica', 'normal');
    doc.text('Este documento no tiene validez fiscal sin el sello correspondiente', pageWidth / 2, footerY + 5, { align: 'center' });
    
    doc.setFontSize(8);
    doc.text(`Documento generado automáticamente el ${new Date().toLocaleString()}`, pageWidth / 2, footerY + 12, { align: 'center' });

    console.log('PDF con diseño Bootstrap generado correctamente');

    // Generar y descargar PDF
    doc.save(`Factura-${sale.id || sale._id || 'No-ID'}.pdf`);

    return true;
  } catch (error) {
    console.error('Error al generar PDF de factura:', error);
    console.log('Intentando con función de respaldo...');
    return generateInvoicePDFAlternative(sale);
  }
};

// Versión alternativa con renderizado más básico
const generateInvoicePDFAlternative = (sale) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Título
  doc.setFontSize(18);
  doc.text('FACTURA DE VENTA', pageWidth / 2, y, { align: 'center' });
  y += 10;

  // ID de venta
  doc.setFontSize(12);
  doc.text(`Factura #: ${sale.id || sale._id || 'N/A'}`, pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Fecha
  const fechaStr = sale.date || sale.fecha || sale.timestamp;
  let fechaVenta = 'Fecha no disponible';
  if (fechaStr) {
    try {
      fechaVenta = new Date(fechaStr).toLocaleDateString();
    } catch (e) {}
  }
  doc.text(`Fecha: ${fechaVenta}`, pageWidth / 2, y, { align: 'center' });
  y += 20;

  // Cliente y método de pago
  doc.setFontSize(10);
  doc.text(`Cliente: ${sale.client || sale.cliente || 'Cliente general'}`, 20, y);
  doc.text(`Método de pago: ${sale.paymentMethod || 'No especificado'}`, pageWidth - 20, y, { align: 'right' });
  y += 20;

  // Productos (versión simple)
  doc.setFontSize(12);
  doc.text('DETALLE DE PRODUCTOS', pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Lista de productos
  if (Array.isArray(sale.items) && sale.items.length > 0) {
    doc.setFontSize(10);

    sale.items.forEach((item, index) => {
      const nombre = item.nombre || item.name || 'Producto sin nombre';
      const cantidad = item.cantidad || item.quantity || 1;
      const precio = item.precioUnitario || item.price || 0;
      const total = item.total || (precio * cantidad) || 0;

      doc.text(`${index + 1}. ${nombre} - ${cantidad} x $${precio.toFixed(2)} = $${total.toFixed(2)}`, 20, y);
      y += 7;

      // Añadir nueva página si es necesario
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
  } else {
    doc.text('No hay detalles de productos disponibles', 20, y);
    y += 10;
  }

  y += 10;

  // Total
  doc.setFontSize(14);
  doc.text(`TOTAL: $${(sale.total || 0).toFixed(2)}`, pageWidth - 20, y, { align: 'right' });

  // Guardar PDF
  doc.save(`Factura-${sale.id || sale._id || 'No-ID'}.pdf`);
  return true;
};

// Función para generar reporte de todas las ventas
export const generateSalesReportPDF = async (sales) => {
  try {
    if (!Array.isArray(sales) || sales.length === 0) {
      throw new Error('No hay datos de ventas para generar el reporte');
    }

    // Crear nuevo documento PDF
    const doc = new jsPDF('landscape');

    // Verificar si autoTable está disponible
    if (typeof doc.autoTable !== 'function') {
      console.warn('AutoTable no está disponible en jsPDF. Usando alternativa.');
      return generateSalesReportPDFAlternative(sales);
    }

    // Añadir metadatos
    doc.setProperties({
      title: 'Reporte de Ventas',
      subject: 'Historial de Ventas',
      author: 'Sistema de Gestión',
      keywords: 'ventas, reporte, historial',
    });

    // Configuración
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20; // Posición Y inicial

    // Título
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text('REPORTE DE VENTAS', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Fecha del reporte
    const now = new Date();
    const fechaReporte = now.toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Generado el: ${fechaReporte}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Resumen
    doc.setFontSize(12);
    doc.text(`Total de ventas: ${sales.length}`, 14, yPos);

    // Calcular suma total
    const sumaTotal = sales.reduce((total, sale) => total + (sale.total || 0), 0);
    doc.text(`Ingresos totales: $${sumaTotal.toFixed(2)}`, pageWidth - 14, yPos, { align: 'right' });
    yPos += 15;

    // Tabla de ventas
    const headers = [['ID', 'Fecha', 'Cliente', 'Método de Pago', 'Total', 'Productos']];

    const data = sales.map(sale => {
      const fechaStr = sale.date || sale.fecha || sale.timestamp;
      let fechaFormateada = 'N/A';

      if (fechaStr) {
        try {
          const fecha = new Date(fechaStr);
          fechaFormateada = fecha.toLocaleDateString() + ' ' + fecha.toLocaleTimeString();
        } catch (error) {}
      }

      let productosStr = 'Sin detalles';
      if (Array.isArray(sale.items) && sale.items.length > 0) {
        const productList = sale.items.slice(0, 3).map(item =>
          `${item.nombre || item.name}: ${item.cantidad || item.quantity}x`
        ).join(', ');

        productosStr = sale.items.length > 3
          ? `${productList}, y ${sale.items.length - 3} más`
          : productList;
      }

      return [
        `#${sale.id || sale._id || 'N/A'}`,
        fechaFormateada,
        sale.client || sale.cliente || 'Cliente general',
        sale.paymentMethod === 'efectivo' ? 'Efectivo' :
          sale.paymentMethod === 'tarjeta' ? 'Tarjeta' :
          sale.paymentMethod || 'No especificado',
        `$${(sale.total || 0).toFixed(2)}`,
        productosStr
      ];
    });

    doc.autoTable({
      startY: yPos,
      head: headers,
      body: data,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202], textColor: 255 },
      margin: { top: 20, right: 14, bottom: 40, left: 14 },
    });

    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Reporte generado automáticamente por el Sistema de Gestión', pageWidth / 2, 200, { align: 'center' });
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, 200, { align: 'right' });
    }

    // Generar y descargar PDF
    doc.save(`Reporte_Ventas_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}.pdf`);

    return true;
  } catch (error) {
    console.error('Error al generar reporte de ventas:', error);
    throw error;
  }
};

// Versión alternativa con renderizado más básico
const generateSalesReportPDFAlternative = (sales) => {
  const doc = new jsPDF('landscape');
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Título
  doc.setFontSize(18);
  doc.text('REPORTE DE VENTAS', pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Fecha del reporte
  doc.setFontSize(10);
  doc.text(`Generado el: ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Resumen
  const sumaTotal = sales.reduce((total, sale) => total + (sale.total || 0), 0);
  doc.setFontSize(12);
  doc.text(`Total de ventas: ${sales.length}`, 20, y);
  doc.text(`Ingresos totales: $${sumaTotal.toFixed(2)}`, pageWidth - 20, y, { align: 'right' });
  y += 20;

  // Cabeceras de columna
  const colWidth = (pageWidth - 40) / 6;
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(66, 139, 202);
  doc.rect(20, y - 6, pageWidth - 40, 10, 'F');

  doc.setTextColor(255, 255, 255);
  doc.text('ID', 20 + colWidth * 0.5, y, { align: 'center' });
  doc.text('Fecha', 20 + colWidth * 1.5, y, { align: 'center' });
  doc.text('Cliente', 20 + colWidth * 2.5, y, { align: 'center' });
  doc.text('Método', 20 + colWidth * 3.5, y, { align: 'center' });
  doc.text('Total', 20 + colWidth * 4.5, y, { align: 'center' });
  doc.text('Productos', 20 + colWidth * 5.5, y, { align: 'center' });
  y += 10;

  // Datos de ventas
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);

  let rowCount = 0;
  sales.forEach(sale => {
    // Alternancia de colores para las filas
    if (rowCount % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(20, y - 6, pageWidth - 40, 10, 'F');
    }

    const fechaStr = sale.date || sale.fecha || sale.timestamp;
    let fechaFormateada = 'N/A';

    if (fechaStr) {
      try {
        const fecha = new Date(fechaStr);
        fechaFormateada = fecha.toLocaleDateString();
      } catch (error) {}
    }

    let metodoPago = sale.paymentMethod === 'efectivo' ? 'Efectivo' :
      sale.paymentMethod === 'tarjeta' ? 'Tarjeta' :
      sale.paymentMethod || 'No especificado';

    doc.text(`#${sale.id || sale._id || 'N/A'}`, 20 + colWidth * 0.5, y, { align: 'center' });
    doc.text(fechaFormateada, 20 + colWidth * 1.5, y, { align: 'center' });
    doc.text(sale.client || sale.cliente || 'Cliente general', 20 + colWidth * 2.5, y, { align: 'center' });
    doc.text(metodoPago, 20 + colWidth * 3.5, y, { align: 'center' });
    doc.text(`$${(sale.total || 0).toFixed(2)}`, 20 + colWidth * 4.5, y, { align: 'center' });

    // Productos resumidos
    let productosStr = 'Sin detalles';
    if (Array.isArray(sale.items) && sale.items.length > 0) {
      const productList = sale.items.slice(0, 2).map(item =>
        `${item.nombre || item.name}: ${item.cantidad || item.quantity}x`
      ).join(', ');

      productosStr = sale.items.length > 2
        ? `${productList}, +${sale.items.length - 2} más`
        : productList;
    }

    doc.text(productosStr, 20 + colWidth * 5.5, y, { align: 'center', maxWidth: colWidth * 0.9 });

    y += 10;
    rowCount++;

    // Nueva página si es necesario
    if (y > 190) {
      doc.addPage('landscape');
      y = 20;

      // Repetir cabeceras en la nueva página
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(66, 139, 202);
      doc.rect(20, y - 6, pageWidth - 40, 10, 'F');

      doc.text('ID', 20 + colWidth * 0.5, y, { align: 'center' });
      doc.text('Fecha', 20 + colWidth * 1.5, y, { align: 'center' });
      doc.text('Cliente', 20 + colWidth * 2.5, y, { align: 'center' });
      doc.text('Método', 20 + colWidth * 3.5, y, { align: 'center' });
      doc.text('Total', 20 + colWidth * 4.5, y, { align: 'center' });
      doc.text('Productos', 20 + colWidth * 5.5, y, { align: 'center' });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      y += 10;
      rowCount = 0;
    }
  });

  // Guardar PDF
  const now = new Date();
  doc.save(`Reporte_Ventas_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}.pdf`);
  return true;
};