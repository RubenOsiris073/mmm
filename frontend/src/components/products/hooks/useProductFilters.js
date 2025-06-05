import { useState, useMemo } from 'react';

/**
 * Hook personalizado para manejar filtros y búsquedas de productos
 */
const useProductFilters = (products = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Extraer categorías únicas
  const allCategories = useMemo(() => {
    return [...new Set(products
      .filter(p => p.categoria)
      .map(p => p.categoria))];
  }, [products]);

  // Productos filtrados
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Filtro de búsqueda por término
      const searchMatch = searchTerm === '' || 
        (product.nombre || product.label || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      
      // Filtro por categoría
      const categoryMatch = selectedCategory === 'all' || 
        product.categoria === selectedCategory;

      return searchMatch && categoryMatch;
    });
  }, [products, searchTerm, selectedCategory]);

  // Productos agrupados por categoría
  const groupedProducts = useMemo(() => {
    const grouped = {};
    
    // Inicializar con categorías conocidas
    allCategories.forEach(cat => {
      grouped[cat] = [];
    });
    
    // Categoría para productos sin categoría asignada
    grouped['sin-categoria'] = [];
    
    // Agrupar productos filtrados
    filteredProducts.forEach(product => {
      if (product.categoria) {
        grouped[product.categoria].push(product);
      } else {
        grouped['sin-categoria'].push(product);
      }
    });
    
    // Filtrar grupos vacíos si se está buscando
    if (searchTerm || selectedCategory !== 'all') {
      Object.keys(grouped).forEach(key => {
        if (grouped[key].length === 0) {
          delete grouped[key];
        }
      });
    }
    
    return grouped;
  }, [filteredProducts, allCategories, searchTerm, selectedCategory]);

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    allCategories,
    filteredProducts,
    groupedProducts,
    clearFilters
  };
};

export default useProductFilters;