/**
 * Formatea un número a formato de moneda (MXN)
 * @param amount - Cantidad a formatear
 * @returns Cadena formateada con el símbolo de peso
 */
export const formatCurrency = (amount: number): string => {
  if (amount === undefined || amount === null) {
    return '$0.00';
  }

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};