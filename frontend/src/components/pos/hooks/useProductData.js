import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import apiService from '../../../services/apiService';

const useProductData = (externalSetError = null) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  // Función para manejar errores
  const handleError = useCallback((error) => {
    console.error('🚨 Error en useProductData:', error);
    const errorMessage = error.message || 'Error desconocido';
    setError(errorMessage);
    
    if (externalSetError) {
      externalSetError(errorMessage);
    } else {
      toast.error(errorMessage);
    }
  }, [externalSetError]);

  // Función para eliminar duplicados
  const removeDuplicateProducts = useCallback((products) => {
    if (!Array.isArray(products)) return [];
    
    const unique = products.filter((product, index, self) => 
      index === self.findIndex(p => p.id === product.id)
    );
    
    console.log(`Productos originales: ${products.length}, únicos: ${unique.length}`);
    return unique;
  }, []);

  // Función para cargar productos
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Cargando productos...');
      
      const response = await apiService.getProducts();
      console.log('Respuesta recibida:', response);
      
      if (!response || !response.data) {
        throw new Error('No se recibieron datos válidos del servidor');
      }

      const productsData = Array.isArray(response.data) ? response.data : [];
      console.log('Datos de productos:', productsData);

      if (productsData.length === 0) {
        console.log('No hay productos disponibles');
        setProducts([]);
        return;
      }

      // Formatear productos
      const formattedProducts = productsData.map(product => ({
        ...product,
        id: product.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: product.name || product.nombre || product.label || "Producto sin nombre",
        nombre: product.nombre || product.name || product.label || "Producto sin nombre",
        label: product.label || product.nombre || product.name || "",
        price: typeof product.price === 'string' ? parseFloat(product.price) : (product.price || product.precio || 0),
        precio: typeof product.precio === 'string' ? parseFloat(product.precio) : (product.precio || product.price || 0),
        stock: typeof product.stock === 'string' ? parseInt(product.stock, 10) : (product.stock || product.cantidad || 0),
        cantidad: typeof product.cantidad === 'string' ? parseInt(product.cantidad, 10) : (product.cantidad || product.stock || 0),
        category: product.category || product.categoria || 'general',
        categoria: product.categoria || product.category || 'general'
      }));

      // Normalización adicional de productos
      const normalizedProducts = formattedProducts.map(product => {
        const stockDisponible = product.cantidad !== undefined ? product.cantidad : (product.stock || 0);
        
        return {
          ...product,
          nombre: product.nombre || product.label || "Producto sin nombre",
          name: product.name || product.nombre || "Producto sin nombre",
          stock: stockDisponible,
          cantidad: stockDisponible,
          precio: typeof product.precio === 'number' ? product.precio : parseFloat(product.precio || 0),
          price: typeof product.price === 'number' ? product.price : parseFloat(product.price || 0),
        };
      });

      setProducts(removeDuplicateProducts(normalizedProducts));
      console.log(`Productos cargados: ${normalizedProducts.length}`, normalizedProducts);
    } catch (err) {
      console.error("Error cargando productos:", err);
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError, removeDuplicateProducts]);

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Productos filtrados con useMemo
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    
    const term = searchTerm.toLowerCase();
    return products.filter(product => 
      (product.name && product.name.toLowerCase().includes(term)) ||
      (product.nombre && product.nombre.toLowerCase().includes(term)) ||
      (product.label && product.label.toLowerCase().includes(term)) ||
      (product.id && product.id.toLowerCase().includes(term))
    );
  }, [products, searchTerm]);

  return {
    products,
    loading,
    filteredProducts,
    searchTerm,
    setSearchTerm,
    loadProducts,
    error
  };
};

export default useProductData;