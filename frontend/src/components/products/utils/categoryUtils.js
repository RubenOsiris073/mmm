/**
 * Utilidades para manejo de categorías de productos
 */

// Obtener color según la categoría
export const getCategoryColor = (category) => {
  const colors = {
    'Bebidas': 'info',
    'Snacks y Botanas': 'warning',
    'Dulces y Chocolates': 'danger',
    'Panadería y Galletas': 'primary',
    'Enlatados y Conservas': 'success',
    'Abarrotes Básicos': 'secondary',
    'Aceites y Condimentos': 'dark',
    'Alimentos Instantáneos': 'light',
    'Bebidas Calientes': 'info',
    'Productos de Limpieza': 'primary',
    'Cuidado Personal': 'warning',
    'sin-categoria': 'secondary'
  };
  return colors[category] || 'light';
};

// Obtener icono para la categoría
export const getCategoryIcon = (category) => {
  const icons = {
    'Bebidas': '🥤',
    'Snacks y Botanas': '🍿',
    'Dulces y Chocolates': '🍫',
    'Panadería y Galletas': '🍞',
    'Enlatados y Conservas': '🥫',
    'Abarrotes Básicos': '🌾',
    'Aceites y Condimentos': '🫒',
    'Alimentos Instantáneos': '🍜',
    'Bebidas Calientes': '☕',
    'Productos de Limpieza': '🧹',
    'Cuidado Personal': '🧴',
    'sin-categoria': '📦'
  };
  return icons[category] || '📦';
};

// Formatear el título de categoría
export const formatCategoryTitle = (category) => {
  if (category === 'sin-categoria') return 'Sin Categoría';
  return category;
};

// Obtener estadísticas de categoría
export const getCategoryStats = (products, category) => {
  const categoryProducts = products.filter(p => 
    category === 'sin-categoria' ? !p.categoria : p.categoria === category
  );
  
  const totalStock = categoryProducts.reduce((sum, p) => 
    sum + (p.cantidad || p.stock || 0), 0
  );
  
  const lowStockProducts = categoryProducts.filter(p => 
    (p.cantidad || p.stock || 0) <= 5
  ).length;

  return {
    totalProducts: categoryProducts.length,
    totalStock,
    lowStockProducts,
    averageStock: categoryProducts.length > 0 ? Math.round(totalStock / categoryProducts.length) : 0
  };
};