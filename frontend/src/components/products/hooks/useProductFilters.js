import { useState, useMemo } from 'react';

/**
 * Hook personalizado para manejar filtros y búsquedas de productos
 */
const useProductFilters = (products = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Obtener todas las categorías únicas
  const allCategories = useMemo(() => {
    if (!Array.isArray(products)) return [];
    
    const categories = new Set();
    products.forEach(product => {
      const category = product.categoria || product.category;
      if (category && category !== 'sin-categoria') {
        categories.add(category);
      }
    });
    
    return Array.from(categories).sort();
  }, [products]);

  // Filtrar productos por búsqueda y categoría
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    
    let filtered = products;
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        (product.nombre && product.nombre.toLowerCase().includes(term)) ||
        (product.name && product.name.toLowerCase().includes(term)) ||
        (product.label && product.label.toLowerCase().includes(term)) ||
        (product.codigo && product.codigo.toLowerCase().includes(term))
      );
    }
    
    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => {
        const productCategory = product.categoria || product.category;
        
        if (selectedCategory === 'sin-categoria') {
          return !productCategory || productCategory === 'sin-categoria';
        }
        
        return productCategory === selectedCategory;
      });
    }
    
    return filtered;
  }, [products, searchTerm, selectedCategory]);

  // Agrupar productos por categoría
  const groupedProducts = useMemo(() => {
    const groups = {};
    
    filteredProducts.forEach(product => {
      const category = product.categoria || product.category || 'sin-categoria';
      
      if (!groups[category]) {
        groups[category] = [];
      }
      
      groups[category].push(product);
    });
    
    // Ordenar categorías, poniendo 'sin-categoria' al final
    const sortedGroups = {};
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === 'sin-categoria') return 1;
      if (b === 'sin-categoria') return -1;
      return a.localeCompare(b);
    });
    
    sortedKeys.forEach(key => {
      sortedGroups[key] = groups[key];
    });
    
    return sortedGroups;
  }, [filteredProducts]);

  // Función para limpiar filtros
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