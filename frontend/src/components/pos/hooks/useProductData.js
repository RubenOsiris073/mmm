import { useState, useEffect, useCallback, useMemo } from 'react';
import apiService from '../../../services/apiService';

/**
 * Custom hook to manage product data and related state
 * @param {Function} externalSetError - Optional external error handler
 * @returns {Object} Product data and related functions
 */
const useProductData = (externalSetError = null) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setInternalError] = useState(null);
  
  // Función para manejar errores internos y externos si están disponibles
  const handleError = useCallback((message, duration = 3000) => {
    console.error(message);
    setInternalError(message);
    
    if (externalSetError) {
      externalSetError(message);
      // Si hay un manejador externo, también configurar un temporizador para limpiar
      if (duration) {
        setTimeout(() => externalSetError(null), duration);
      }
    }
    
    // Siempre limpiar el error interno después de un tiempo
    if (duration) {
      setTimeout(() => setInternalError(null), duration);
    }
  }, [externalSetError]);

  // Cargar datos de productos mejorado
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Cargando datos de productos...");
      
      // Obtener productos desde la API
      const productsResponse = await apiService.getProducts();
      
      // Verificar estructura de respuesta
      let productsData = [];
      
      if (productsResponse?.products) {
        // Formato 1: { products: [...] }
        productsData = productsResponse.products;
      } else if (Array.isArray(productsResponse)) {
        // Formato 2: directamente array
        productsData = productsResponse;
      } else {
        throw new Error("Formato de respuesta de productos no válido");
      }
      
      if (!productsData.length) {
        console.log("No se recibieron productos de la API");
      }
      
      // Normalizar y mejorar los datos de productos
      const formattedProducts = productsData.map(product => ({
        ...product,
        // Garantizar que todos los productos tienen campos esenciales
        id: product.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nombre: product.nombre || product.label || "Producto sin nombre",
        label: product.label || product.nombre || "",
        precio: typeof product.precio === 'string' ? parseFloat(product.precio) : (product.precio || 0),
        stock: typeof product.stock === 'string' ? parseInt(product.stock, 10) : (product.stock || 0),
        categoria: product.categoria || 'general'
      }));

      // Añadir normalización de productos al cargarlos
      const normalizedProducts = formattedProducts.map(product => {
        // Normalizar la estructura del producto
        const stockDisponible = product.cantidad !== undefined ? product.cantidad : (product.stock || 0);
        
        return {
          ...product,
          nombre: product.nombre || product.label || "Producto sin nombre",
          stock: stockDisponible,
          cantidad: stockDisponible, // Mantener ambos para compatibilidad
          precio: typeof product.precio === 'number' ? product.precio : parseFloat(product.precio || 0),
        };
      });

      setProducts(normalizedProducts);
      console.log(`Productos cargados: ${normalizedProducts.length}`, normalizedProducts);
    } catch (err) {
      console.error("Error cargando productos:", err);
      handleError(`Error al cargar productos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Filtrar productos por término de búsqueda - versión mejorada
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    
    const term = searchTerm.toLowerCase().trim();
    
    return products.filter(product => {
      // Normalizar texto para mejor búsqueda
      const nombre = (product.nombre || '').toLowerCase();
      const label = (product.label || '').toLowerCase();
      const categoria = (product.categoria || '').toLowerCase();
      const codigo = (product.codigo || '').toString().toLowerCase();
      
      return nombre.includes(term) || 
             label.includes(term) || 
             categoria.includes(term) ||
             codigo.includes(term);
    });
  }, [products, searchTerm]);

  // Función para recargar los datos manualmente
  const refreshData = useCallback(async () => {
    await loadProducts();
  }, [loadProducts]);

  // Agrupar productos por categoría
  const productsByCategory = useMemo(() => {
    const grouped = {};
    
    products.forEach(product => {
      const category = product.categoria || 'sin-categoria';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(product);
    });
    
    return grouped;
  }, [products]);

  return {
    products,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filteredProducts,
    refreshData,
    loadProducts,
    productsByCategory
  };
};

export default useProductData;