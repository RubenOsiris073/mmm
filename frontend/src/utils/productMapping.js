// Mapeo de labels de detección a información de productos
export const DETECTION_PRODUCT_MAPPING = {
  // Labels principales que mencionaste
  'Cacahuates_Kiyakis': {
    nombre: 'Cacahuates',
    categoria: 'Snacks y Botanas',
    subcategoria: 'Snacks',
    precio: 15.00,
    unidadMedida: 'pieza',
    perecedero: true,
    stockMinimo: 10,
    descripcion: 'Snack detectado automáticamente'
  },
  'Botella_Ciel': {
    nombre: 'Botella de Agua',
    categoria: 'Bebidas',
    subcategoria: 'Agua embotellada',
    precio: 12.00,
    unidadMedida: 'pieza',
    perecedero: false,
    stockMinimo: 20,
    descripcion: 'Botella de agua detectada automáticamente'
  },
  'Trident': {
    nombre: 'Chicle',
    categoria: 'Dulces y Chocolates',
    subcategoria: 'Chicles',
    precio: 5.00,
    unidadMedida: 'pieza',
    perecedero: false,
    stockMinimo: 25,
    descripcion: 'Chicle detectado automáticamente'
  },
  
  // Labels adicionales comunes
  'Dr.Peppe': {
    nombre: 'Refresco',
    categoria: 'Bebidas',
    subcategoria: 'Refrescos',
    precio: 18.00,
    unidadMedida: 'pieza',
    perecedero: false,
    stockMinimo: 15,
    descripcion: 'Refresco detectado automáticamente'
  },
  'Takis': {
    nombre: 'Takis',
    categoria: 'Snacks y Botanas',
    subcategoria: 'Snacks',
    precio: 15.00,
    unidadMedida: 'pieza',
    perecedero: true,
    stockMinimo: 10,
    descripcion: 'Snack detectado automáticamente'
  },
  'Pop': {
    nombre: 'Cacahuates',
    categoria: 'Snacks y Botanas',
    subcategoria: 'Snacks',
    precio: 15.00,
    unidadMedida: 'pieza',
    perecedero: true,
    stockMinimo: 10,
    descripcion: 'Snack detectado automáticamente'
  },
  'Sabritas': {
    nombre: 'Sabritas',
    categoria: 'Snacks y Botanas',
    subcategoria: 'Snacks',
    precio: 15.00,
    unidadMedida: 'pieza',
    perecedero: true,
    stockMinimo: 10,
    descripcion: 'Snack detectado automáticamente'
  },
  'pan': {
    nombre: 'Pan',
    categoria: 'Panadería y Galletas',
    subcategoria: 'Pan dulce',
    precio: 8.00,
    unidadMedida: 'pieza',
    perecedero: true,
    stockMinimo: 20,
    descripcion: 'Pan detectado automáticamente'
  },
  'yogurt': {
    nombre: 'Yogurt',
    categoria: 'Lácteos',
    subcategoria: 'Yogures',
    precio: 15.00,
    unidadMedida: 'pieza',
    perecedero: true,
    stockMinimo: 12,
    descripcion: 'Yogurt detectado automáticamente'
  },
  'Del Valle': {
    nombre: 'Jugo',
    categoria: 'Bebidas',
    subcategoria: 'Jugos',
    precio: 22.00,
    unidadMedida: 'pieza',
    perecedero: true,
    stockMinimo: 15,
    descripcion: 'Jugo detectado automáticamente'
  }
};

// Función para obtener información del producto basada en el label detectado
export const getProductInfoFromLabel = (label) => {
  const normalizedLabel = label.toLowerCase().trim();
  
  // Buscar coincidencia exacta
  if (DETECTION_PRODUCT_MAPPING[normalizedLabel]) {
    return DETECTION_PRODUCT_MAPPING[normalizedLabel];
  }
  
  // Buscar coincidencia parcial
  for (const [key, productInfo] of Object.entries(DETECTION_PRODUCT_MAPPING)) {
    if (normalizedLabel.includes(key) || key.includes(normalizedLabel)) {
      return productInfo;
    }
  }
  
  // Si no encuentra coincidencia, retornar información genérica
  return {
    nombre: `Producto Detectado: ${label}`,
    categoria: 'Varios',
    subcategoria: 'Productos detectados',
    precio: 10.00,
    unidadMedida: 'pieza',
    perecedero: true, // Por seguridad, asumir que es perecedero
    stockMinimo: 5,
    descripcion: `Producto detectado automáticamente: ${label}`
  };
};

// Función para generar código automático basado en el label
export const generateProductCodeFromLabel = (label) => {
  const prefix = label.substring(0, 3).toUpperCase();
  const suffix = Math.random().toString(36).substr(2, 3).toUpperCase();
  return `${prefix}${suffix}`;
};

// Función para calcular fecha de caducidad sugerida basada en la categoría
export const getSuggestedExpirationDate = (categoria, perecedero) => {
  if (!perecedero) {
    // Productos no perecederos: 1 año
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  }
  
  const today = new Date();
  let daysToAdd = 30; // Default: 30 días
  
  switch (categoria) {
    case 'Bebidas':
      daysToAdd = 90; // 3 meses
      break;
    // ...otros casos si existen...
  }
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split('T')[0];
}