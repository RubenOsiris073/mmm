import { useState, useEffect, useMemo } from 'react';

/**
 * Hook para filtros de productos en entorno de testing
 * Maneja búsqueda, filtrado por categoría y agrupación de productos
 */
const useProductFiltersTest = (products = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Obtener todas las categorías únicas
  const allCategories = useMemo(() => {
    const categories = [...new Set(products.map(p => p.categoria || 'sin-categoria'))];
    return categories.sort();
  }, [products]);

  // Filtrar productos basado en búsqueda y categoría
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        (product.nombre || '').toLowerCase().includes(searchLower) ||
        (product.codigo || '').toLowerCase().includes(searchLower) ||
        (product.categoria || '').toLowerCase().includes(searchLower) ||
        (product.descripcion || '').toLowerCase().includes(searchLower)
      );
    }

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        (product.categoria || 'sin-categoria') === selectedCategory
      );
    }

    return filtered;
  }, [products, searchTerm, selectedCategory]);

  // Agrupar productos por categoría
  const groupedProducts = useMemo(() => {
    const groups = {};
    
    filteredProducts.forEach(product => {
      const category = product.categoria || 'sin-categoria';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(product);
    });

    // Ordenar productos dentro de cada categoría por nombre
    Object.keys(groups).forEach(category => {
      groups[category].sort((a, b) => 
        (a.nombre || '').localeCompare(b.nombre || '')
      );
    });

    return groups;
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
    clearFilters,
    totalFiltered: filteredProducts.length
  };
};

export default useProductFiltersTest;