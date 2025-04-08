import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Función para generar PDF de una factura individual
export const generateInvoicePDF = async (sale) => {
  try {
    // Verificamos si jsPDF está correctamente configurado
    const doc = new jsPDF();

    if (typeof doc.autoTable !== 'function') {
      console.warn('AutoTable no está disponible en jsPDF. Usando alternativa.');
      return generateInvoicePDFAlternative(sale);
    }

    // Añadir metadatos
    doc.setProperties({
      title: `Factura-${sale.id || sale._id || 'No-ID'}`,
      subject: 'Factura de venta',
      author: 'Sistema de Gestión',
      keywords: 'factura, venta, cliente',
    });

    // Configuración
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20; // Posición Y inicial

    // Título de factura
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text('FACTURA', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Información de la empresa
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text('EMPRESA S.A.', pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;
    doc.setFontSize(10);
    doc.text('Dirección de la Empresa', pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;
    doc.text('Teléfono: +123 456 7890 | Email: info@empresa.com', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Línea divisoria
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 10;

    // Información de la factura
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text(`Factura #: ${sale.id || sale._id || 'No-ID'}`, 14, yPos);

    const fechaStr = sale.date || sale.fecha || sale.timestamp;
    let fechaFormateada = 'Fecha no disponible';

    if (fechaStr) {
      try {
        const fecha = new Date(fechaStr);
        fechaFormateada = format(fecha, 'dd/MM/yyyy HH:mm', { locale: es });
      } catch (error) {
        console.error('Error al formatear fecha:', error);
      }
    }

    doc.text(`Fecha: ${fechaFormateada}`, pageWidth - 14, yPos, { align: 'right' });
    yPos += 15;

    // Información del cliente
    doc.setFontSize(12);
    doc.text('Cliente:', 14, yPos);
    yPos += 6;
    doc.setFontSize(10);
    doc.text(`Nombre: ${sale.client || sale.cliente || 'Cliente general'}`, 14, yPos);

    // Si hay información adicional del cliente
    if (sale.clienteInfo) {
      if (sale.clienteInfo.email) {
        yPos += 6;
        doc.text(`Email: ${sale.clienteInfo.email}`, 14, yPos);
      }
      if (sale.clienteInfo.telefono) {
        yPos += 6;
        doc.text(`Teléfono: ${sale.clienteInfo.telefono}`, 14, yPos);
      }
      if (sale.clienteInfo.direccion) {
        yPos += 6;
        doc.text(`Dirección: ${sale.clienteInfo.direccion}`, 14, yPos);
      }
    }

    // Información del método de pago
    yPos = 70; // Reset para alinear con información del cliente
    doc.text('Detalles de Pago:', pageWidth - 90, yPos);
    yPos += 6;

    let metodoPago = 'No especificado';
    if (sale.paymentMethod === 'efectivo') {
      metodoPago = 'Efectivo';
    } else if (sale.paymentMethod === 'tarjeta') {
      metodoPago = 'Tarjeta';
    } else if (sale.paymentMethod) {
      metodoPago = sale.paymentMethod;
    }

    doc.text(`Método: ${metodoPago}`, pageWidth - 90, yPos);
    yPos += 6;
    doc.text('Estado: Pagado', pageWidth - 90, yPos);

    if (sale.paymentMethod === 'efectivo') {
      yPos += 6;
      doc.text(`Recibido: $${(sale.amountReceived || 0).toFixed(2)}`, pageWidth - 90, yPos);
      yPos += 6;
      doc.text(`Cambio: $${(sale.change || 0).toFixed(2)}`, pageWidth - 90, yPos);
    }

    yPos += 15;

    // Tabla de productos
    if (Array.isArray(sale.items) && sale.items.length > 0) {
      const headers = [['#', 'Producto', 'Cantidad', 'Precio', 'Total']];

      const data = sale.items.map((item, index) => [
        index + 1,
        item.nombre || item.name || 'Producto sin nombre',
        item.cantidad || item.quantity || 1,
        `$${(item.precioUnitario || item.price || 0).toFixed(2)}`,
        `$${(item.total || (item.precioUnitario * item.cantidad) || 0).toFixed(2)}`
      ]);

      doc.autoTable({
        startY: yPos,
        head: headers,
        body: data,
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202], textColor: 255 },
        footStyles: { fillColor: [240, 240, 240], textColor: 80, fontStyle: 'bold' },
        margin: { top: 20, right: 14, bottom: 40, left: 14 },
        foot: [['', '', '', 'TOTAL:', `$${(sale.total || 0).toFixed(2)}`]],
      });

      yPos = doc.lastAutoTable.finalY + 15;
    } else {
      doc.text('No hay detalles de productos disponibles', 14, yPos);
      yPos += 15;
    }

    // Notas
    doc.setFontSize(10);
    doc.text('Notas:', 14, yPos);
    yPos += 6;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Gracias por su compra. Este documento sirve como comprobante de pago.', 14, yPos);

    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Este documento no tiene validez fiscal sin el sello de la empresa.', pageWidth / 2, 285, { align: 'center' });
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, 285, { align: 'right' });
    }

    // Generar y descargar PDF
    doc.save(`Factura-${sale.id || sale._id || 'No-ID'}.pdf`);

    return true;
  } catch (error) {
    console.error('Error al generar PDF de factura:', error);
    throw error;
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